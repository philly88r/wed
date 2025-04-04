-- Migration to add missing columns to seating_tables
-- Execute this directly against the database using the connection string:
-- postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres

-- Add length column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'seating_tables'
        AND column_name = 'length'
    ) THEN
        ALTER TABLE seating_tables ADD COLUMN length NUMERIC DEFAULT 100;
        UPDATE seating_tables SET length = 100 WHERE length IS NULL;
        RAISE NOTICE 'Added length column to seating_tables table';
    ELSE
        RAISE NOTICE 'Length column already exists in seating_tables table';
    END IF;
END $$;

-- Add width column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'seating_tables'
        AND column_name = 'width'
    ) THEN
        ALTER TABLE seating_tables ADD COLUMN width NUMERIC DEFAULT 100;
        UPDATE seating_tables SET width = 100 WHERE width IS NULL;
        RAISE NOTICE 'Added width column to seating_tables table';
    ELSE
        RAISE NOTICE 'Width column already exists in seating_tables table';
    END IF;
END $$;

-- Add position_x column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'seating_tables'
        AND column_name = 'position_x'
    ) THEN
        ALTER TABLE seating_tables ADD COLUMN position_x NUMERIC DEFAULT 300;
        UPDATE seating_tables SET position_x = 300 WHERE position_x IS NULL;
        RAISE NOTICE 'Added position_x column to seating_tables table';
    ELSE
        RAISE NOTICE 'position_x column already exists in seating_tables table';
    END IF;
END $$;

-- Add position_y column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'seating_tables'
        AND column_name = 'position_y'
    ) THEN
        ALTER TABLE seating_tables ADD COLUMN position_y NUMERIC DEFAULT 200;
        UPDATE seating_tables SET position_y = 200 WHERE position_y IS NULL;
        RAISE NOTICE 'Added position_y column to seating_tables table';
    ELSE
        RAISE NOTICE 'position_y column already exists in seating_tables table';
    END IF;
END $$;
