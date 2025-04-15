-- First, drop the foreign key constraint if it exists
ALTER TABLE table_instances 
DROP CONSTRAINT IF EXISTS table_instances_created_by_fkey;

-- Add created_by column if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE table_instances ADD COLUMN created_by uuid;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Make sure the system user exists in auth.users
DO $$ 
BEGIN
    INSERT INTO auth.users (id, email, role)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'system@wedding-planner.com',
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Update all null created_by to system user
UPDATE table_instances 
SET created_by = '00000000-0000-0000-0000-000000000000'
WHERE created_by IS NULL;

-- Make created_by not null and add foreign key constraint
ALTER TABLE table_instances 
ALTER COLUMN created_by SET NOT NULL,
ADD CONSTRAINT table_instances_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES auth.users(id);

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
