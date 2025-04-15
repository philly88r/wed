-- Add created_by column to seating_tables
ALTER TABLE seating_tables
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add created_by column to table_chairs
ALTER TABLE table_chairs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
