// Compress-Archive -Path * -DestinationPath function.zip
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET } = process.env;
exports.handler = async (event) => {
  const path = event.rawPath || event.requestContext?.http?.path;
  const method = event.requestContext?.http?.method;

  if (path === "/api/create-user" && method === "POST") {
    return await createUser(event);
  } else if (path === "/api/login" && method === "POST") {
    return await handleLogin(event);
  } else if (path === "/api/logout" && method === "POST") {
    return handleLogout();
  } else if (path === "/api/add-to-cart" && method === "POST") {
    return addToCart(event);
  } else if (path === "/api/update-cart-item" && method === "PATCH") {
    return updateCartItem(event);
  } else if (path === "/api/remove-from-cart" && method === "DELETE") {
    return removeFromCart(event);
  } else if (path === "/api/create-order" && method === "POST") {
    return createOrder(event);
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

const getTokenFromEvent = (event) => {
  try {
    const cookies =
      event?.cookies ||
      (event.headers?.cookie ? [event.headers.cookie] : []) ||
      (event.headers?.Cookie ? [event.headers.Cookie] : []);

    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));
    return token;
  } catch (error) {
    return null;
  }
};

const addToCart = async (event) => {
  try {
    // Extract user email from JWT token
    const token = getTokenFromEvent(event);
    if (!token) {
      return response(401, `Unauthorized: No token provided ${JSON.stringify(event.body)}`);
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    const { item_id, attributes } = JSON.parse(event.body);
    const quantity = 1; // Default quantity as per requirement

    // Validate input
    if (!item_id || !attributes || typeof attributes !== 'object' || Object.keys(attributes).length === 0) {
      return response(400, { error: "Missing required fields: item_id and attributes object" });
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Begin transaction
    await connection.beginTransaction();

    try {
      // 1. Check if all attribute combinations exist
      for (const [category, categoryValue] of Object.entries(attributes)) {
        const [attributeCheck] = await connection.execute(
          `SELECT 1 FROM attributes 
           WHERE item_id = ? AND category = ? AND category_value = ?`,
          [item_id, category, categoryValue]
        );

        if (attributeCheck.length === 0) {
          await connection.rollback();
          await connection.end();
          return response(404, { 
            error: "Item variant not found",
            details: `Combination not found: ${category}=${categoryValue}`
          });
        }
      }

      // 2. Create cart item entry
      const cartItemId = uuidv4(); // Generate unique ID for cart item
      await connection.execute(
        `INSERT INTO cart_items (cart_item_id, email, item_id, quantity)
         VALUES (?, ?, ?, ?)`,
        [cartItemId, email, item_id, quantity]
      );

      // 3. Add all attributes for this cart item
      for (const [category, categoryValue] of Object.entries(attributes)) {
        await connection.execute(
          `INSERT INTO cart_item_attributes 
           (cart_item_id, item_id, category, category_value)
           VALUES (?, ?, ?, ?)`,
          [cartItemId, item_id, category, categoryValue]
        );
      }

      // Commit transaction
      await connection.commit();
      await connection.end();
      
      return response(200, { 
        message: "Item added to cart successfully",
        cart_item_id: cartItemId,
        item_id: item_id,
        attributes: attributes
      });

    } catch (error) {
      await connection.rollback();
      throw error; // This will be caught by the outer catch
    }

  } catch (error) {
    console.error("Error in addToCart:", error);
    return response(500, { error: "Internal server error", details: error.message });
  }
};

const updateCartItem = async (event) => {
  try {
    // Extract user email from JWT token
    const token = getTokenFromEvent(event);
    if (!token) {
      return response(401, `Unauthorized: No token provided ${JSON.stringify(event.body)}`);
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    const { cart_item_id, quantity } = JSON.parse(event.body);

    // Validate input
    if (!cart_item_id || quantity === undefined) {
      return response(400, { error: "Missing required fields: cart_item_id and quantity" });
    }

    if (quantity <= 0) {
      // If quantity is 0 or negative, we should remove the item (or you might want to return an error)
      return response(400, { error: "Quantity must be positive. Use delete endpoint to remove items." });
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Begin transaction
    await connection.beginTransaction();

    try {
      // 1. Verify the cart item belongs to this user
      const [existingItem] = await connection.execute(
        `SELECT 1 FROM cart_items 
         WHERE cart_item_id = ? AND email = ?`,
        [cart_item_id, email]
      );

      if (existingItem.length === 0) {
        await connection.rollback();
        await connection.end();
        return response(404, { error: "Cart item not found or doesn't belong to user" });
      }

      // 2. Update quantity in cart_items table
      await connection.execute(
        `UPDATE cart_items SET quantity = ? 
         WHERE cart_item_id = ?`,
        [quantity, cart_item_id]
      );

      // Commit transaction
      await connection.commit();
      await connection.end();
      
      return response(200, { 
        message: "Cart item updated successfully",
        cart_item_id: cart_item_id,
        new_quantity: quantity
      });

    } catch (error) {
      await connection.rollback();
      throw error; // This will be caught by the outer catch
    }

  } catch (error) {
    console.error("Error in updateCartItem:", error);
    return response(500, { error: "Internal server error", details: error.message });
  }
};

const removeFromCart = async (event) => {
  try {
    // Extract user email from JWT token
    const token = getTokenFromEvent(event);
    if (!token) {
      return response(401, `Unauthorized: No token provided ${JSON.stringify(event.body)}`);
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    const { cart_item_id } = JSON.parse(event.body);

    // Validate input
    if (!cart_item_id) {
      return response(400, { error: "Missing required field: cart_item_id" });
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Begin transaction
    await connection.beginTransaction();

    try {
      // 1. Verify the cart item belongs to this user
      const [existingItem] = await connection.execute(
        `SELECT 1 FROM cart_items 
         WHERE cart_item_id = ? AND email = ?`,
        [cart_item_id, email]
      );

      if (existingItem.length === 0) {
        await connection.rollback();
        await connection.end();
        return response(404, { error: "Cart item not found or doesn't belong to user" });
      }

      // 2. Delete from cart_item_attributes first (due to foreign key constraint)
      await connection.execute(
        `DELETE FROM cart_item_attributes 
         WHERE cart_item_id = ?`,
        [cart_item_id]
      );

      // 3. Delete from cart_items
      const [result] = await connection.execute(
        `DELETE FROM cart_items 
         WHERE cart_item_id = ?`,
        [cart_item_id]
      );

      // Commit transaction
      await connection.commit();
      await connection.end();

      if (result.affectedRows === 0) {
        return response(404, { error: "Cart item not found" });
      }

      return response(200, { 
        message: "Item removed from cart successfully",
        cart_item_id: cart_item_id
      });

    } catch (error) {
      await connection.rollback();
      throw error; // This will be caught by the outer catch
    }

  } catch (error) {
    console.error("Error in removeFromCart:", error);
    return response(500, { error: "Internal server error", details: error.message });
  }
};

const createOrder = async (event) => {
  const token = getTokenFromEvent(event);
  if (!token) {
    return response(
      401,
      `Unauthorized: No token provided ${JSON.stringify(eventBody)}`
    );
  }
  const jwtToken = token.split("=")[1];
  const decoded = jwt.verify(jwtToken, JWT_SECRET);
  const email = decoded.email;
  const { shippingAddress } = JSON.parse(event.body);

  if (!email || !shippingAddress) {
    return response(400, { error: "Email and shipping address are required" });
  }

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  try {
    const orderId = uuidv4();

    // Call the stored procedure
    const [results] = await connection.query(
      `CALL confirm_and_create_order(?, ?, ?, @status, @message);
       SELECT @status as status, @message as message;`,
      [orderId, email, shippingAddress]
    );

    const { status, message } = results[1][0];

    if (status !== 200) {
      return response(status, { error: message });
    }

    return response(200, {
      success: true,
      orderId: orderId,
      message: message,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    return response(500, {
      error: "Order processing failed",
      details: error.message,
    });
  } finally {
    await connection.end();
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
