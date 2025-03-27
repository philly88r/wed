-- Create or update tables for the seating chart feature
DO $$
BEGIN
    -- Check if table_templates exists and add is_predefined column if needed
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_templates') THEN
        -- Add is_predefined column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'is_predefined') THEN
            ALTER TABLE table_templates ADD COLUMN is_predefined BOOLEAN DEFAULT true;
        END IF;
        
        -- Add created_by column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'created_by') THEN
            ALTER TABLE table_templates ADD COLUMN created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL;
        END IF;
        
        -- Add width and length columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'width') THEN
            ALTER TABLE table_templates ADD COLUMN width NUMERIC NOT NULL DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'length') THEN
            ALTER TABLE table_templates ADD COLUMN length NUMERIC NOT NULL DEFAULT 0;
        END IF;
        
        -- Drop dimensions column if it exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'dimensions') THEN
            ALTER TABLE table_templates DROP COLUMN dimensions;
        END IF;
        
        -- Drop user_id column if it exists
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'table_templates' AND column_name = 'user_id') THEN
            ALTER TABLE table_templates DROP COLUMN user_id;
        END IF;
    ELSE
        -- Create table templates table to store predefined table shapes
        CREATE TABLE table_templates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            created_by UUID DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL,
            name TEXT NOT NULL,
            shape TEXT NOT NULL CHECK (shape IN ('round', 'rectangular', 'square', 'oval')),
            width NUMERIC NOT NULL,
            length NUMERIC NOT NULL,
            seats INTEGER NOT NULL,
            is_predefined BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Check if seating_tables exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'seating_tables') THEN
        -- Add user_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'seating_tables' AND column_name = 'user_id') THEN
            ALTER TABLE seating_tables ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        -- Add template_id column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'seating_tables' AND column_name = 'template_id') THEN
            ALTER TABLE seating_tables ADD COLUMN template_id UUID REFERENCES table_templates(id);
        END IF;
        
        -- Add rotation column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'seating_tables' AND column_name = 'rotation') THEN
            ALTER TABLE seating_tables ADD COLUMN rotation INTEGER DEFAULT 0;
        END IF;
    ELSE
        -- Create seating_tables table
        CREATE TABLE seating_tables (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            template_id UUID REFERENCES table_templates(id),
            seats INTEGER NOT NULL,
            shape TEXT NOT NULL CHECK (shape IN ('round', 'rectangular', 'square', 'oval')),
            position JSONB NOT NULL, -- { x, y }
            rotation INTEGER DEFAULT 0, -- Rotation in degrees
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Check if table_chairs exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_chairs') THEN
        -- Create table for chair positions
        CREATE TABLE table_chairs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            table_id UUID REFERENCES seating_tables(id) ON DELETE CASCADE,
            position INTEGER NOT NULL, -- Position number around the table
            angle FLOAT, -- Angle in degrees for positioning
            guest_id UUID, -- NULL if chair is empty
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(table_id, position) -- Each position at a table must be unique
        );
    END IF;
END
$$;

-- Add RLS policies for table_templates if they don't exist
DO $$
BEGIN
    -- Enable RLS on table_templates if not already enabled
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE tablename = 'table_templates' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE table_templates ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Add policies if they don't exist
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'table_templates' 
        AND policyname = 'Predefined templates are visible to all authenticated users'
    ) THEN
        CREATE POLICY "Predefined templates are visible to all authenticated users" ON table_templates
            FOR SELECT
            TO authenticated
            USING (is_predefined = true OR created_by = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'table_templates' 
        AND policyname = 'Users can insert their own custom templates'
    ) THEN
        CREATE POLICY "Users can insert their own custom templates" ON table_templates
            FOR INSERT
            TO authenticated
            WITH CHECK (created_by = auth.uid() AND is_predefined = false);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'table_templates' 
        AND policyname = 'Users can update their own custom templates'
    ) THEN
        CREATE POLICY "Users can update their own custom templates" ON table_templates
            FOR UPDATE
            TO authenticated
            USING (created_by = auth.uid() AND is_predefined = false)
            WITH CHECK (created_by = auth.uid() AND is_predefined = false);
    END IF;

    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE tablename = 'table_templates' 
        AND policyname = 'Users can delete their own custom templates'
    ) THEN
        CREATE POLICY "Users can delete their own custom templates" ON table_templates
            FOR DELETE
            TO authenticated
            USING (created_by = auth.uid() AND is_predefined = false);
    END IF;
END
$$;

-- Add RLS policies for seating_tables if they don't exist
DO $$
BEGIN
    -- Check if user_id column exists before adding RLS policies
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'seating_tables' 
        AND column_name = 'user_id'
    ) THEN
        -- Enable RLS on seating_tables if not already enabled
        IF NOT EXISTS (
            SELECT FROM pg_tables 
            WHERE tablename = 'seating_tables' 
            AND rowsecurity = true
        ) THEN
            ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
        END IF;

        -- Add policies if they don't exist
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'seating_tables' 
            AND policyname = 'Users can view their own tables'
        ) THEN
            CREATE POLICY "Users can view their own tables" ON seating_tables
                FOR SELECT
                TO authenticated
                USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'seating_tables' 
            AND policyname = 'Users can insert their own tables'
        ) THEN
            CREATE POLICY "Users can insert their own tables" ON seating_tables
                FOR INSERT
                TO authenticated
                WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'seating_tables' 
            AND policyname = 'Users can update their own tables'
        ) THEN
            CREATE POLICY "Users can update their own tables" ON seating_tables
                FOR UPDATE
                TO authenticated
                USING (auth.uid() = user_id)
                WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'seating_tables' 
            AND policyname = 'Users can delete their own tables'
        ) THEN
            CREATE POLICY "Users can delete their own tables" ON seating_tables
                FOR DELETE
                TO authenticated
                USING (auth.uid() = user_id);
        END IF;
    END IF;
END
$$;

-- Add RLS policies for table_chairs if they don't exist
DO $$
BEGIN
    -- Enable RLS on table_chairs if not already enabled
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_chairs') THEN
        IF NOT EXISTS (
            SELECT FROM pg_tables 
            WHERE tablename = 'table_chairs' 
            AND rowsecurity = true
        ) THEN
            ALTER TABLE table_chairs ENABLE ROW LEVEL SECURITY;
        END IF;

        -- Add policies if they don't exist
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'table_chairs' 
            AND policyname = 'Users can view chairs for their tables'
        ) THEN
            CREATE POLICY "Users can view chairs for their tables" ON table_chairs
                FOR SELECT
                TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM seating_tables 
                    WHERE seating_tables.id = table_chairs.table_id 
                    AND seating_tables.user_id = auth.uid()
                ));
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'table_chairs' 
            AND policyname = 'Users can insert chairs for their tables'
        ) THEN
            CREATE POLICY "Users can insert chairs for their tables" ON table_chairs
                FOR INSERT
                TO authenticated
                WITH CHECK (EXISTS (
                    SELECT 1 FROM seating_tables 
                    WHERE seating_tables.id = table_chairs.table_id 
                    AND seating_tables.user_id = auth.uid()
                ));
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'table_chairs' 
            AND policyname = 'Users can update chairs for their tables'
        ) THEN
            CREATE POLICY "Users can update chairs for their tables" ON table_chairs
                FOR UPDATE
                TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM seating_tables 
                    WHERE seating_tables.id = table_chairs.table_id 
                    AND seating_tables.user_id = auth.uid()
                ))
                WITH CHECK (EXISTS (
                    SELECT 1 FROM seating_tables 
                    WHERE seating_tables.id = table_chairs.table_id 
                    AND seating_tables.user_id = auth.uid()
                ));
        END IF;

        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE tablename = 'table_chairs' 
            AND policyname = 'Users can delete chairs for their tables'
        ) THEN
            CREATE POLICY "Users can delete chairs for their tables" ON table_chairs
                FOR DELETE
                TO authenticated
                USING (EXISTS (
                    SELECT 1 FROM seating_tables 
                    WHERE seating_tables.id = table_chairs.table_id 
                    AND seating_tables.user_id = auth.uid()
                ));
        END IF;
    END IF;
END
$$;

-- Insert predefined table templates if they don't exist
DO $$
BEGIN
    -- Only insert if the table exists and doesn't have these templates
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'table_templates') THEN
        -- Round table
        IF NOT EXISTS (SELECT FROM table_templates WHERE name = 'Round Table - 8 Seats' AND is_predefined = true) THEN
            INSERT INTO table_templates (name, shape, seats, width, length, is_predefined)
            VALUES ('Round Table - 8 Seats', 'round', 8, 100, 100, true);
        END IF;
        
        -- Rectangle table
        IF NOT EXISTS (SELECT FROM table_templates WHERE name = 'Rectangle Table - 6 Seats' AND is_predefined = true) THEN
            INSERT INTO table_templates (name, shape, seats, width, length, is_predefined)
            VALUES ('Rectangle Table - 6 Seats', 'rectangular', 6, 200, 100, true);
        END IF;
        
        -- Oval table
        IF NOT EXISTS (SELECT FROM table_templates WHERE name = 'Oval Table - 10 Seats' AND is_predefined = true) THEN
            INSERT INTO table_templates (name, shape, seats, width, length, is_predefined)
            VALUES ('Oval Table - 10 Seats', 'oval', 10, 200, 120, true);
        END IF;
        
        -- Square table
        IF NOT EXISTS (SELECT FROM table_templates WHERE name = 'Square Table - 4 Seats' AND is_predefined = true) THEN
            INSERT INTO table_templates (name, shape, seats, width, length, is_predefined)
            VALUES ('Square Table - 4 Seats', 'square', 4, 100, 100, true);
        END IF;
    END IF;
END
$$;

-- Create function to automatically create chairs when a table is created
CREATE OR REPLACE FUNCTION create_chairs_for_table()
RETURNS TRIGGER AS $$
DECLARE
  i INTEGER;
  angle FLOAT;
BEGIN
  -- For each seat in the table, create a chair
  FOR i IN 1..NEW.seats LOOP
    -- Calculate angle for positioning (evenly distributed around the table)
    angle := (i - 1) * (360.0 / NEW.seats);
    
    -- Insert the chair
    INSERT INTO table_chairs (table_id, position, angle)
    VALUES (NEW.id, i, angle);
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create chairs when a table is created
DO $$
BEGIN
    -- Drop the trigger if it exists
    DROP TRIGGER IF EXISTS create_chairs_trigger ON seating_tables;
    
    -- Create the trigger
    CREATE TRIGGER create_chairs_trigger
    AFTER INSERT ON seating_tables
    FOR EACH ROW
    EXECUTE FUNCTION create_chairs_for_table();
END
$$;
