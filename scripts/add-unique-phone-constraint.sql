-- Add unique constraint on phone field for customers table
-- This ensures that each phone number can only be associated with one customer

-- First, check if there are any duplicate phone numbers
SELECT phone, COUNT(*) as count
FROM customers
GROUP BY phone
HAVING COUNT(*) > 1;

-- If there are duplicates, you may need to clean them up first
-- Then add the unique constraint

-- Add unique constraint on phone field
ALTER TABLE customers 
ADD CONSTRAINT customers_phone_unique UNIQUE (phone);

-- Create an index for better performance on phone lookups
CREATE INDEX IF NOT EXISTS idx_customers_phone_unique ON customers(phone);

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'customers' AND constraint_name = 'customers_phone_unique'; 