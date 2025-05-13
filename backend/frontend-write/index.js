// Compress-Archive -Path * -DestinationPath function.zip
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET } = process.env;
exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path;
  const method = event.requestContext?.http?.method;

  if (path === "/api/create-user" && method === "POST") {
    return await createUser(event);
  } else if (path === "/api/login" && method === "POST") {
    return await handleLogin(event);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ message: `${path}` }),
  };
};

const createUser = async (event) => {
  // Input validation
  if (!event.body) {
    return response(400, { message: "Request body is missing" });
  }

  let userData;
  try {
    userData = JSON.parse(event.body);
  } catch (e) {
    return response(400, { message: "Invalid JSON payload" });
  }

  const { email, password, firstName, lastName, telephone } = userData;

  // Validate required fields
  if (!email || !password) {
    return response(400, { message: "Email and password are required" });
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Hash the password with salt
    const saltRounds = 10; // Adjust based on your security needs
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Call the stored procedure with hashed password
    const [result] = await connection.execute(
      "CALL create_user(?, ?, ?, ?, ?)",
      [email, firstName, lastName, telephone, hashedPassword]
    );

    return response(201, { message: "User created successfully" });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.message.includes("Email already exists")) {
      return response(409, { message: "Email already exists" });
    }

    if (error.message.includes("Telephone already exists")) {
      return response(409, { message: "Telephone already exists" });
    }

    return response(500, { message: "Internal server error" });
  } finally {
    if (connection) await connection.end();
  }
};

async function handleLogin(event) {
  try {
    const body = JSON.parse(event.body);
    const { email, password } = body;

    if (!email || !password) {
      return response(400, { message: "Email and password required" });
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Get user with hashed password from database
    const [rows] = await connection.execute(
      "SELECT email, password, first_name, last_name, telephone FROM users WHERE email = ?",
      [email]
    );

    await connection.end();

    if (rows.length === 0) {
      return response(401, { message: "Invalid credentials" });
    }

    const user = rows[0];

    // Compare provided password with hashed password from database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return response(401, { message: "Invalid credentials" });
    }

    // Create JWT token with user data (excluding password)
    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        telephone: user.telephone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": `token=${token}; HttpOnly; Secure; Path=/; Max-Age=${
          24 * 60 * 60
        }; SameSite=None`,
        "Content-Type": "application/json",
      },
    };
  } catch (err) {
    return response(500, { message: "Internal Server Error" });
  }
}

function response(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
