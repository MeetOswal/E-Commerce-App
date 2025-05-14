DELIMITER //

CREATE PROCEDURE confirm_and_create_order(
    IN p_order_id VARCHAR(36),
    IN p_email VARCHAR(255),
    IN p_shipping_address VARCHAR(500),
    OUT p_status INT,
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE cart_item_count INT DEFAULT 0;
    DECLARE items_processed INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        GET DIAGNOSTICS CONDITION 1 p_message = MESSAGE_TEXT;
        SET p_status = 500;
    END;
    
    -- Check if cart has active items
    SELECT COUNT(*) INTO cart_item_count 
    FROM cart c
    JOIN items i ON c.item_id = i.item_id
    WHERE c.email = p_email
    AND i.item_status = 'active';
    
    IF cart_item_count = 0 THEN
        SET p_status = 400;
        SET p_message = 'No active items in cart';
    ELSE
        START TRANSACTION;
        
        -- Create order header
        INSERT INTO orders (order_id, email, order_date, shipping_address)
        VALUES (p_order_id, p_email, NOW(), p_shipping_address);
        
        -- Move only active items to order details
        INSERT INTO order_details (order_id, item_id, category, category_value, quantity, payment_amount)
        SELECT 
            p_order_id,
            c.item_id,
            c.category,
            c.category_value,
            c.quantity,
            (i.price * c.quantity) AS payment_amount
        FROM cart c
        JOIN items i ON c.item_id = i.item_id
        WHERE c.email = p_email
        AND i.item_status = 'active';
        
        SET items_processed = ROW_COUNT();
        
        -- Only delete cart items that were successfully ordered
        DELETE c FROM cart c
        JOIN items i ON c.item_id = i.item_id
        WHERE c.email = p_email
        AND i.item_status = 'active';
        
        COMMIT;
        SET p_status = 200;
        SET p_message = CONCAT('Order created with ', items_processed, ' items');
    END IF;
END //

DELIMITER ;