-- Add source field to reviews table to track feedback origin
-- This allows us to distinguish between website feedback and direct reviews

-- Add source column to reviews table
ALTER TABLE reviews 
ADD COLUMN source VARCHAR(50) DEFAULT 'Direct Review' CHECK (source IN ('Website Feedback', 'Direct Review', 'Admin Created'));

-- Update existing reviews to have 'Direct Review' as source
UPDATE reviews SET source = 'Direct Review' WHERE source IS NULL;

-- Create index for better performance on source lookups
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'reviews' AND column_name = 'source'; 