DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS variant_attribute;
DROP TABLE IF EXISTS variant;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS users;
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
    item_status ENUM('active', 'discontinued'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category) REFERENCES category(category)
);

-- Variant table
CREATE TABLE variant (
    item_id VARCHAR(36),
    variant_id VARCHAR(36),
    price DECIMAL(10,2),
    photo VARCHAR(500),
    quantity INT,
    variant_status ENUM('active', 'discontinued'),
    PRIMARY KEY (item_id, variant_id),
    FOREIGN KEY (item_id) REFERENCES items(item_id)
);

-- Variant Attribute table (formerly variant_option)
CREATE TABLE variant_attribute (
    item_id VARCHAR(36),
    variant_id VARCHAR(36),
    category VARCHAR(100),
    category_value VARCHAR(255),
    PRIMARY KEY (item_id, variant_id, category),
    FOREIGN KEY (item_id, variant_id) REFERENCES variant(item_id, variant_id)
);

-- Cart table
CREATE TABLE cart (
    email VARCHAR(255),
    item_id VARCHAR(36),
    variant_id VARCHAR(36),
    quantity INT,
    PRIMARY KEY (email, item_id, variant_id),
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (item_id, variant_id) REFERENCES variant(item_id, variant_id)
);

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(36),
    email VARCHAR(255),
    item_id VARCHAR(36),
    variant_id VARCHAR(36),
    quantity INT,
    order_date DATETIME,
    payment_amount DECIMAL(10,2),
    PRIMARY KEY (order_id, email, item_id, variant_id),
    FOREIGN KEY (email) REFERENCES users(email),
    FOREIGN KEY (item_id, variant_id) REFERENCES variant(item_id, variant_id)
);
