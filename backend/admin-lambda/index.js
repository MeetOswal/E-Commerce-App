// Compress-Archive -Path * -DestinationPath function.zip
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  JWT_SECRET,
  REGION,
  BUCKET_NAME,
} = process.env;

const s3Client = new S3Client({
  region: REGION,
});

exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path;
  const method = event.requestContext?.http?.method;

  if (path === "/api/login" && method === "POST") {
    return await handleLogin(event);
  }

  if (path === "/api/logout" && method === "POST") {
    return handleLogout();
  }

  if (path === "/api/additem" && method === "POST") {
    return await handleAddItem(event);
  }

  if (path === "/api/check-auth" && method === "GET") {
    return checkAuth(event);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ message: `${path}` }),
  };
};

const checkAuth = (event) => {
  try {
    const cookies =
      event?.cookies || event.headers?.cookie || event.headers?.Cookie || "";
    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) {
      return response(
        401,
        `Unauthorized: No token provided ${JSON.stringify(eventBody)}`
      );
    }
    const jwtToken = token.split("=")[1];
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, JWT_SECRET);
      return response(200, "authenticated: true");
    } catch (err) {
      console.error("JWT verification failed:", err);
      return response(401, "Unauthorized: Invalid token");
    }
  } catch (error) {
    return response(404, `Cookie Not Found ${error}`);
  }
};

// Login Handler
async function handleLogin(event) {
  try {
    const body = JSON.parse(event.body);
    const { username, password } = body;

    if (!username || !password) {
      return response(400, "Username and password required");
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    const [rows] = await connection.execute(
      "SELECT * FROM admins WHERE username = ? AND password = ?",
      [username, password]
    );

    await connection.end();

    if (rows.length === 0) {
      return response(401, "Invalid credentials");
    }

    const token = jwt.sign({ username, role: rows[0].user_role }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Secure; Path=/; Max-Age=3600; SameSite=None`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "OK" }),
    };
  } catch (err) {
    console.error(err);
    return response(500, "Internal Server Error");
  }
}

// Logout Handler
function handleLogout() {
  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": `token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=None`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Logged out" }),
  };
}

async function handleAddItem(event) {
  try {
    // Authentication and authorization checks (same as before)
    const cookies =
      event?.cookies || event.headers?.cookie || event.headers?.Cookie || "";
    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) {
      return response(401, `Unauthorized: Login required`);
    }
    const jwtToken = token.split("=")[1];
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, JWT_SECRET);
    } catch (err) {
      return response(401, "Unauthorized: Invalid token, please login again");
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    const [rows] = await connection.execute(
      `SELECT * FROM admins WHERE username = ? AND (user_role = 'admin' or user_role = 'staff')`,
      [decoded.username]
    );

    if (rows.length === 0) {
      await connection.end();
      return response(403, "Forbidden: User does not have admin access");
    }

    // Parse the request body with new schema
    const body = JSON.parse(event.body);
    const {
      title,
      description,
      seller,
      category,
      itemStatus,
      price,
      photos,
      attributes
    } = body;

    const itemId = uuidv4();

    // Start transaction
    await connection.beginTransaction();

    try {
      // Insert main item
      await connection.execute(
        `INSERT INTO items (item_id, title, item_description, seller, category, price, item_status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [itemId, title, description, seller, category, price, itemStatus]
      );

      // Insert photos
      for (const [index, photo] of photos.entries()) {
        const photoId = uuidv4();
        const photoKey = `items/${itemId}/photos/${photoId}.jpg`;
        const photoBuffer = Buffer.from(photo, "base64");

        try {
          // Upload to S3
          const putObjectCommand = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: photoKey,
            Body: photoBuffer,
            ContentType: "image/jpeg",
          });
          await s3Client.send(putObjectCommand);

          // Store photo URL in database
          const photoUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${photoKey}`;
          await connection.execute(
            `INSERT INTO photos (item_id, photo_id, photo) VALUES (?, ?, ?)`,
            [itemId, photoId, photoUrl]
          );
        } catch (uploadErr) {
          console.error("Error uploading photo to S3:", uploadErr);
          throw new Error("Failed to upload image to S3");
        }
      }

      for (const att of attributes){
        for (const value of att.values) {
          if (value.trim() !== "") {
            await connection.execute(
              `INSERT INTO attributes (item_id, category, category_value) VALUES (?, '${att.attribute}', ?)`,
              [itemId, value]
            );
          }
        }
      }

      // Commit transaction if all operations succeed
      await connection.commit();
      await connection.end();

      return response(200, "Item added successfully");
    } catch (error) {
      // Rollback transaction if any operation fails
      await connection.rollback();
      await connection.end();
      return response(500, `Failed to add item: ${error.message}`);
    }
  } catch (err) {
    console.error(err);
    return response(500, err.message || "Internal server error");
  }
}

// Utility response formatter
function response(statusCode, message) {
  return {
    statusCode,
    body: JSON.stringify({ message }),
  };
}
