-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE table_instances ADD COLUMN created_by uuid DEFAULT '00000000-0000-0000-0000-000000000000';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Make created_by not null
ALTER TABLE table_instances 
ALTER COLUMN created_by SET NOT NULL;

-- Enable RLS on table_instances if not already enabled
ALTER TABLE table_instances ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON table_instances;
DROP POLICY IF EXISTS "Allow public insert access" ON table_instances;
DROP POLICY IF EXISTS "Allow public update access" ON table_instances;
DROP POLICY IF EXISTS "Allow public delete access" ON table_instances;

-- Create policies for public access
CREATE POLICY "Allow public read access"
    ON table_instances
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access"
    ON table_instances
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access"
    ON table_instances
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow public delete access"
    ON table_instances
    FOR DELETE
    USING (true);
