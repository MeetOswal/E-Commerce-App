// Compress-Archive -Path * -DestinationPath function.zip
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET } = process.env;
exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path;
  const method = event.requestContext?.http?.method;

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

function response(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  };
}
