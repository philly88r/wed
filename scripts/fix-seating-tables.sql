-- Check if length column exists and add it if needed
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

    -- Check if width column exists and add it if needed
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
