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
  } else if (path === "/api/get-profile" && method === "GET") {
    return checkProfile(event);
  } else if (path === "/api/get-category" && method === "GET") {
    return getCategoryData(event);
  } else if (path === "/api/get-item" && method === "GET") {
    return getItemDetails(event);
  } else if (path === "/api/get-order-list" && method === "GET") {
    return getOrdersList(event);
  } else if (path === "/api/get-order" && method === "GET") {
    return getOrderDetails(event);
  } else if (path === "/api/get-cart" && method === "GET") {
    return getCart(event);
  }
  return {
    statusCode: 404,
    body: JSON.stringify({ message: `${path}` }),
  };
};

const checkAuth = (event) => {
  try {
    const cookies =
      event?.cookies ||
      (event.headers?.cookie ? [event.headers.cookie] : []) ||
      (event.headers?.Cookie ? [event.headers.Cookie] : []);
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

const checkProfile = (event) => {
  try {
    const cookies =
      event?.cookies ||
      (event.headers?.cookie ? [event.headers.cookie] : []) ||
      (event.headers?.Cookie ? [event.headers.Cookie] : []);

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
      if (
        !decoded.email ||
        !decoded.firstName ||
        !decoded.lastName ||
        !decoded.telephone
      ) {
        return response(401, { error: "Incomplete token payload" });
      }

      // Return data directly from the token
      return response(200, {
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email,
        telephone: decoded.telephone,
      });
    } catch (err) {
      console.error("JWT verification failed:", err);
      return response(401, "Unauthorized: Invalid token");
    }
  } catch (error) {
    return response(404, `Cookie Not Found ${error}`);
  }
};

// GET /api/get-category-data?category=electronics&page=1&limit=20
const getCategoryData = async (event) => {
  try {
    // Extract category from query parameters
    const category = event.queryStringParameters?.category;
    const page = parseInt(event.queryStringParameters?.page) || 1 ;
    const limit = parseInt(event.queryStringParameters?.limit) || 50;

    if (!category) {
      return response(400, { error: "Category parameter is required" });
    }

    // Connect to the database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Query to get items with their first photo for the specified category
      const [items] = await connection.execute(
        `
        SELECT 
          i.item_id,
          i.title,
          i.price,
          i.category,
          i.created_at,
          (SELECT p.photo 
           FROM photos p 
           WHERE p.item_id = i.item_id 
           LIMIT 1) AS photo
        FROM items i
        WHERE i.item_status = 'active'
        AND i.category = ?
        ORDER BY i.created_at DESC
        LIMIT 50 OFFSET ?
      `,
        [category, toString(offset)]
      );

    // Get total count of items in this category
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM items WHERE item_status = 'active' AND category = ?`,
      [category]
    );

    await connection.end();

    return response(200, {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countResult[0].total / limit),
        totalItems: countResult[0].total,
        itemsPerPage: limit,
      },
      items: items.map((item) => ({
        itemId: item.item_id,
        title: item.title,
        price: item.price,
        photo: item.photo,
        createdAt: item.created_at,
      })),
    });
  } catch (error) {
    console.error("Error in getCategoryData:", error);
    return response(500, { error: `Internal server error ${error}` });
  }
};

// GET /api/get-category-data?itemId=asdsafdsfdsfsdfdsffs
const getItemDetails = async (event) => {
  try {
    // Extract itemId from query parameters
    const itemId = event.queryStringParameters?.itemId;

    if (!itemId) {
      return response(400, { error: "itemId parameter is required" });
    }

    // Connect to the database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Get item details
    const [itemRows] = await connection.execute(
      `SELECT 
        item_id, 
        title, 
        item_description, 
        seller, 
        category, 
        price, 
        item_status,
        created_at
       FROM items 
       WHERE item_id = ?`,
      [itemId]
    );

    if (itemRows.length === 0) {
      await connection.end();
      return response(404, { error: "Item not found" });
    }

    const item = itemRows[0];

    // Get all photos for the item
    const [photos] = await connection.execute(
      `SELECT photo_id, photo 
       FROM photos 
       WHERE item_id = ?`,
      [itemId]
    );

    // Get all attributes for the item
    const [attributes] = await connection.execute(
      `SELECT category, category_value 
       FROM attributes 
       WHERE item_id = ?`,
      [itemId]
    );

    await connection.end();

    // Format attributes into a more usable structure
    const formattedAttributes = {};
    attributes.forEach((attr) => {
      if (!formattedAttributes[attr.category]) {
        formattedAttributes[attr.category] = [];
      }
      formattedAttributes[attr.category].push(attr.category_value);
    });

    return response(200, {
      item: {
        id: item.item_id,
        title: item.title,
        description: item.item_description,
        seller: item.seller,
        category: item.category,
        price: item.price,
        status: item.item_status,
        createdAt: item.created_at,
        photos: photos.map((p) => ({
          id: p.photo_id,
          url: p.photo,
        })),
        attributes: formattedAttributes,
      },
    });
  } catch (error) {
    console.error("Error in getItemDetails:", error);
    return response(500, { error: "Internal server error" });
  }
};

//  GET /api/get-order-list?page=1
const getOrdersList = async (event) => {
  try {
    const cookies =
      event?.cookies ||
      (event.headers?.cookie ? [event.headers.cookie] : []) ||
      (event.headers?.Cookie ? [event.headers.Cookie] : []);

    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) {
      return response(
        401,
        `Unauthorized: No token provided ${JSON.stringify(eventBody)}`
      );
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    // Get pagination parameters
    const page = parseInt(event.queryStringParameters?.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Connect to database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Get orders with pagination
    const [orders] = await connection.execute(
      `SELECT 
        order_id, 
        order_date, 
        created_at
       FROM orders 
       WHERE email = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [email, limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await connection.execute(
      `SELECT COUNT(*) as total FROM orders WHERE email = ?`,
      [email]
    );

    await connection.end();

    return response(200, {
      orders: orders.map((order) => ({
        orderId: order.order_id,
        orderDate: order.order_date,
        createdAt: order.created_at,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(countResult[0].total / limit),
        totalOrders: countResult[0].total,
      },
    });
  } catch (error) {
    console.error("Error in getOrdersList:", error);
    return response(500, { error: "Internal server error" });
  }
};

const getOrderDetails = async (event) => {
  try {
    const cookies =
      event?.cookies ||
      (event.headers?.cookie ? [event.headers.cookie] : []) ||
      (event.headers?.Cookie ? [event.headers.Cookie] : []);

    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) {
      return response(
        401,
        `Unauthorized: No token provided ${JSON.stringify(eventBody)}`
      );
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    const orderId = event.queryStringParameters?.orderId;
    if (!orderId) {
      return response(400, { error: "orderId parameter is required" });
    }

    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Verify order ownership
    const [orderCheck] = await connection.execute(
      `SELECT 1 FROM orders WHERE order_id = ? AND email = ?`,
      [orderId, email]
    );

    if (orderCheck.length === 0) {
      await connection.end();
      return response(404, { error: "Order not found or unauthorized" });
    }

    // Get order summary
    const [orderSummary] = await connection.execute(
      `SELECT 
        order_id, 
        order_date, 
        shipping_address,
        created_at
       FROM orders 
       WHERE order_id = ?`,
      [orderId]
    );

    // Get order items with details
    const [orderItems] = await connection.execute(
      `SELECT 
        od.item_id,
        od.quantity,
        od.payment_amount,
        od.category,
        od.category_value,
        i.title,
       FROM order_details od
       JOIN items i ON od.item_id = i.item_id
       WHERE od.order_id = ?`,
      [orderId]
    );

    // Calculate total

    const totalAmount =
      Math.round(
        orderItems.reduce((sum, item) => sum + item.payment_amount, 0) * 100
      ) / 100;

    await connection.end();

    return response(200, {
      order: {
        orderId: orderSummary[0].order_id,
        orderDate: orderSummary[0].order_date,
        shippingAddress: orderSummary[0].shipping_address,
        createdAt: orderSummary[0].created_at,
        items: orderItems.map((item) => ({
          itemId: item.item_id,
          title: item.title,
          category: item.category,
          variant: item.category_value,
          quantity: item.quantity,
          price: item.price,
          paymentAmount: item.payment_amount,
        })),
        totalAmount: totalAmount,
      },
    });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    return response(500, { error: `Internal server error ${error}` });
  }
};

const getCart = async (event) => {
  try {
    // Extract user email from JWT token
    const cookies = event?.cookies || 
                   (event.headers?.cookie ? [event.headers.cookie] : []) || 
                   (event.headers?.Cookie ? [event.headers.Cookie] : []);
    const token = cookies.find((cookie) => cookie.trim().startsWith("token="));

    if (!token) {
      return response(401, `Unauthorized: No token provided`);
    }
    const jwtToken = token.split("=")[1];
    const decoded = jwt.verify(jwtToken, JWT_SECRET);
    const email = decoded.email;

    // Connect to the database
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    });

    // Query to get cart items with product details and attributes
    const [cartItems] = await connection.execute(
      `
      SELECT 
        ci.cart_item_id,
        ci.item_id,
        ci.quantity,
        i.title,
        i.price,
        (SELECT p.photo FROM photos p WHERE p.item_id = ci.item_id LIMIT 1) AS photo,
        JSON_OBJECTAGG(cia.category, cia.category_value) AS attributes
      FROM cart_items ci
      JOIN items i ON ci.item_id = i.item_id
      LEFT JOIN cart_item_attributes cia ON ci.cart_item_id = cia.cart_item_id
      WHERE ci.email = ?
      AND i.item_status = 'active'
      GROUP BY ci.cart_item_id, ci.item_id, ci.quantity, i.title, i.price
      `,
      [email]
    );

    await connection.end();

    // Calculate total price
    const total = Math.round(
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;

    return response(200, {
      items: cartItems.map((item) => ({
        cartItemId: item.cart_item_id,
        itemId: item.item_id,
        title: item.title,
        price: item.price,
        photo: item.photo,
        quantity: item.quantity,
        attributes: item.attributes, // Convert JSON string to object
        subtotal: item.price * item.quantity,
      })),
      total: total,
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    return response(500, { error: "Internal server error", details: JSON.stringify(error.message )});
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
