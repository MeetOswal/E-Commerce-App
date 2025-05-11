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

  return {
    statusCode: 404,
    body: JSON.stringify({ message: `${path}` }),
  };
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
      expiresIn: "1h",
    });

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Secure; Path=/; Max-Age=3600`,
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
      "Set-Cookie": `token=deleted; HttpOnly; Secure; Path=/; Max-Age=0`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Logged out" }),
  };
}

async function handleAddItem(event) {
  try {
    const cookies = event?.cookies || event.headers?.cookie || event.headers?.Cookie || '';
    const token = cookies.find((cookie) => cookie.trim().startsWith('token='));

    if (!token) {
      return response(401, `Unauthorized: No token provided ${JSON.stringify(eventBody)}`);
    }
    const jwtToken = token.split('=')[1];
    let decoded;
    try {
      decoded = jwt.verify(jwtToken, JWT_SECRET);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return response(401, 'Unauthorized: Invalid token');
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
      return response(403, 'Forbidden: User does not have admin access');
    }

    // Parse the request body
    const body = JSON.parse(event.body);
    const { title, description, seller, category, itemStatus, variants } = body;

    const itemId = uuidv4();

    await connection.execute(
      `INSERT INTO items (item_id, title, item_description, seller, category, item_status) VALUES (?, ?, ?, ?, ?, ?)`,
      [itemId, title, description, seller, category, itemStatus]
    );

    for (const variant of variants) {
      const { price, photo, quantity, variantStatus, attributes } = variant;

      const variantId = uuidv4();

      const photoBuffer = Buffer.from(photo, "base64");
      const photoKey = `items/${itemId}/variants/${variantId}.jpg`;

      try {
        const putObjectCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: photoKey,
          Body: photoBuffer,
          ContentType: "image/jpeg",
        });

        await s3Client.send(putObjectCommand);
      } catch (uploadErr) {
        console.error("Error uploading to S3:", uploadErr);
        return response(500, "Failed to upload image to S3");
      }

      const photoUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${photoKey}`;

      await connection.execute(
        `INSERT INTO variant (item_id, variant_id, price, photo, quantity, variant_status) VALUES (?, ?, ?, ?, ?, ?)`,
        [itemId, variantId, price, photoUrl, quantity, variantStatus]
      );

      for (const attribute of attributes) {
        const { category: attrCategory, categoryValue } = attribute;
        await connection.execute(
          `INSERT INTO variant_attribute (item_id, variant_id, category, category_value) VALUES (?, ?, ?, ?)`,
          [itemId, variantId, attrCategory, categoryValue]
        );
      }
    }
    await connection.end();

    return response(200, "Item added successfully");
  } catch (err) {
    console.error(err);
    return response(500, err);
  }
}

// Utility response formatter
function response(statusCode, message) {
  return {
    statusCode,
    body: JSON.stringify({ message }),
  };
}
