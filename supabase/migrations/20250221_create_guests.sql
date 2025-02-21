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
