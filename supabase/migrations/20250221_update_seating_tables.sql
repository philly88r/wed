-- Update seating_tables table to support visual layout
DO $$ 
BEGIN
    -- Add shape column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seating_tables' 
        AND column_name = 'shape'
    ) THEN
        ALTER TABLE public.seating_tables
        ADD COLUMN shape VARCHAR(50) DEFAULT 'circle';
    END IF;

    -- Add color column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seating_tables' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE public.seating_tables
        ADD COLUMN color VARCHAR(50);
    END IF;

    -- Add position column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seating_tables' 
        AND column_name = 'position'
    ) THEN
        ALTER TABLE public.seating_tables
        ADD COLUMN position JSONB DEFAULT '{"x": 0, "y": 0}'::jsonb;
    END IF;
END $$;
