-- Customer loyalty and tier management triggers
-- This script creates functions and triggers to automatically manage customer loyalty points and tiers

-- Function to calculate loyalty points based on service price
CREATE OR REPLACE FUNCTION calculate_loyalty_points(service_price DECIMAL)
RETURNS INTEGER AS $$
BEGIN
    -- Award 1 point per 10 rupees spent
    RETURN FLOOR(service_price / 10);
END;
$$ LANGUAGE plpgsql;

-- Function to determine tier based on total visits and spending
CREATE OR REPLACE FUNCTION determine_customer_tier(total_visits INTEGER, total_spent DECIMAL)
RETURNS VARCHAR(20) AS $$
BEGIN
    -- Bronze: 0-4 visits or < 500 spent
    -- Silver: 5-9 visits or 500-999 spent
    -- Gold: 10-19 visits or 1000-1999 spent
    -- Platinum: 20+ visits or 2000+ spent
    
    IF total_visits >= 20 OR total_spent >= 2000 THEN
        RETURN 'Platinum';
    ELSIF total_visits >= 10 OR total_spent >= 1000 THEN
        RETURN 'Gold';
    ELSIF total_visits >= 5 OR total_spent >= 500 THEN
        RETURN 'Silver';
    ELSE
        RETURN 'Bronze';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer loyalty when appointment is completed
CREATE OR REPLACE FUNCTION update_customer_loyalty()
RETURNS TRIGGER AS $$
DECLARE
    loyalty_points_to_add INTEGER;
    new_total_spent DECIMAL;
    new_total_visits INTEGER;
    new_tier VARCHAR(20);
BEGIN
    -- Only update when appointment status changes to 'Completed'
    IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
        
        -- Calculate loyalty points for this service
        loyalty_points_to_add := calculate_loyalty_points(NEW.price);
        
        -- Update customer record
        UPDATE customers 
        SET 
            loyalty_points = loyalty_points + loyalty_points_to_add,
            total_spent = total_spent + NEW.price,
            total_visits = total_visits + 1,
            last_visit = CURRENT_DATE,
            updated_at = NOW()
        WHERE phone = NEW.customerphone;
        
        -- Get updated values for tier calculation
        SELECT total_spent, total_visits INTO new_total_spent, new_total_visits
        FROM customers 
        WHERE phone = NEW.customerphone;
        
        -- Determine new tier
        new_tier := determine_customer_tier(new_total_visits, new_total_spent);
        
        -- Update tier if it changed
        UPDATE customers 
        SET tier = new_tier
        WHERE phone = NEW.customerphone AND tier != new_tier;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update customer loyalty when appointment is completed
DROP TRIGGER IF EXISTS trigger_update_customer_loyalty ON appointments;
CREATE TRIGGER trigger_update_customer_loyalty
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_loyalty();

-- Function to update favorite service based on most booked service
CREATE OR REPLACE FUNCTION update_favorite_service()
RETURNS TRIGGER AS $$
DECLARE
    most_booked_service VARCHAR(255);
BEGIN
    -- Only update when appointment status changes to 'Completed'
    IF NEW.status = 'Completed' AND (OLD.status IS NULL OR OLD.status != 'Completed') THEN
        
        -- Find the most booked service for this customer
        SELECT service INTO most_booked_service
        FROM appointments
        WHERE customerphone = NEW.customerphone 
          AND status = 'Completed'
        GROUP BY service
        ORDER BY COUNT(*) DESC
        LIMIT 1;
        
        -- Update favorite service if found
        IF most_booked_service IS NOT NULL THEN
            UPDATE customers 
            SET favorite_service = most_booked_service
            WHERE phone = NEW.customerphone;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update favorite service
DROP TRIGGER IF EXISTS trigger_update_favorite_service ON appointments;
CREATE TRIGGER trigger_update_favorite_service
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_favorite_service();

-- Insert success message
INSERT INTO data_backups (backup_name, backup_data, created_by, description) 
VALUES ('Customer Loyalty System', '{"message": "Customer loyalty triggers and functions created successfully"}', 'System', 'Customer loyalty management system setup completed'); 