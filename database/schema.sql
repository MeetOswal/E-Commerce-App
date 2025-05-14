DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS variant_attribute;
DROP TABLE IF EXISTS variant;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cart_item_attributes;
-- DROP TABLE IF EXISTS admins;

-- Users table 
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    telephone VARCHAR(20),
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CREATE TABLE admins (
--     username VARCHAR(255) PRIMARY KEY,
--     user_role ENUM('admin', 'staff'),
--     password VARCHAR(255),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Category table
CREATE TABLE category (
    category VARCHAR(100) PRIMARY KEY
);

-- Items table
CREATE TABLE items (
    item_id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    item_description TEXT,
    seller VARCHAR(255),
    category VARCHAR(100),
    price DECIMAL(10,2),
    item_status ENUM('active', 'discontinued'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES category(category)
);

-- Variant table
CREATE TABLE photos (
    item_id VARCHAR(36),
    photo_id VARCHAR(36),
    photo VARCHAR(500),
    PRIMARY KEY (item_id, photo_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- Variant Attribute table (formerly variant_option)
CREATE TABLE attributes (
    item_id VARCHAR(36),
    category VARCHAR(100),
    category_value VARCHAR(255),
    PRIMARY KEY (item_id, category, category_value),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- Cart table
CREATE TABLE cart_items (
    cart_item_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

CREATE TABLE cart_item_attributes (
    cart_item_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    category VARCHAR(100) NOT NULL,
    category_value VARCHAR(255) NOT NULL,
    PRIMARY KEY (cart_item_id, category),
    FOREIGN KEY (cart_item_id) REFERENCES cart_items(cart_item_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id, category, category_value) REFERENCES attributes(item_id, category, category_value)
);

CREATE TABLE orders (
	order_id VARCHAR(36),
    email VARCHAR(255),
    order_date DATETIME,
    shipping_address VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id, email),
    FOREIGN KEY (email) REFERENCES users(email)
);

-- Orders table
CREATE TABLE order_details (
    order_id VARCHAR(36),
    item_id VARCHAR(36),
    category VARCHAR(100),
    category_value VARCHAR(255),
    quantity INT,
    payment_amount DECIMAL(10,2),
    PRIMARY KEY (order_id, item_id, category, category_value),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
   FOREIGN KEY (item_id, category, category_value) REFERENCES attributes(item_id, category, category_value)
);
