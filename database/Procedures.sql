
-- Create User Procuder
DELIMITER //
CREATE PROCEDURE create_user(
    IN p_email VARCHAR(255),
    IN p_first_name VARCHAR(100),
    IN p_last_name VARCHAR(100),
    IN p_telephone VARCHAR(20),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE email_exists INT;
    DECLARE telephone_exists INT;
    
    -- Check if email already exists
    SELECT COUNT(*) INTO email_exists FROM users WHERE email = p_email;
    
    IF email_exists > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Email already exists';
    END IF;
    
    -- Check if telephone already exists (assuming telephone is unique)
    SELECT COUNT(*) INTO telephone_exists FROM users WHERE telephone = p_telephone;
    
    IF telephone_exists > 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Telephone already exists';
    END IF;
    
    -- If checks pass, insert the new user
    INSERT INTO users (email, first_name, last_name, telephone, password)
    VALUES (p_email, p_first_name, p_last_name, p_telephone, p_password);
    
    SELECT 'User created successfully' AS message;
END //
DELIMITER ;