DELIMITER //
CREATE TRIGGER after_item_status_change
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    DECLARE carts_affected INT;
    
    -- Only proceed if status changed to discontinued
    IF NEW.item_status = 'discontinued' AND OLD.item_status != 'discontinued' THEN
        -- Count how many cart entries will be removed
        SELECT COUNT(*) INTO carts_affected
        FROM cart_items
        WHERE item_id = NEW.item_id;
        
        -- Create temporary table to store cart_item_ids to delete
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_cart_items_to_delete (
            cart_item_id VARCHAR(36) PRIMARY KEY
        );
        
        -- Insert cart items to delete into temp table
        INSERT INTO temp_cart_items_to_delete
        SELECT cart_item_id FROM cart_items WHERE item_id = NEW.item_id;
        
        -- First delete from cart_item_attributes (due to foreign key)
        DELETE cia FROM cart_item_attributes cia
        JOIN temp_cart_items_to_delete t ON cia.cart_item_id = t.cart_item_id;
        
        -- Then delete from cart_items
        DELETE ci FROM cart_items ci
        JOIN temp_cart_items_to_delete t ON ci.cart_item_id = t.cart_item_id;
        
        -- Drop the temporary table
        DROP TEMPORARY TABLE IF EXISTS temp_cart_items_to_delete;
        
        -- Log detailed cleanup information
        IF carts_affected > 0 THEN
            INSERT INTO system_logs (action, description)
            VALUES (
                'cart_cleanup', 
                CONCAT('Removed item ', NEW.item_id, ' from ', carts_affected, ' carts')
            );
        END IF;
    END IF;
END //
DELIMITER ;