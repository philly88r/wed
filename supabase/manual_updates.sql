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

-- Create guests table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'guests'
    ) THEN
        CREATE TABLE public.guests (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            table_id UUID REFERENCES public.seating_tables(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Enable read access for all users" ON public.guests
            FOR SELECT USING (true);

        CREATE POLICY "Enable insert for authenticated users only" ON public.guests
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Enable update for authenticated users only" ON public.guests
            FOR UPDATE USING (auth.role() = 'authenticated');

        CREATE POLICY "Enable delete for authenticated users only" ON public.guests
            FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;
