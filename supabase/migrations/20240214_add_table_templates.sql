-- Create a system user UUID if needed (for templates)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ 
BEGIN
    -- Create system_user if it doesn't exist
    INSERT INTO auth.users (id, email, role)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'system@wedding-planner.com',
        'authenticated'
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Create table_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_templates (
    id uuid primary key default uuid_generate_v4(),
    created_by uuid not null default '00000000-0000-0000-0000-000000000000' references auth.users(id),
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE table_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON table_templates;

-- Allow public access for now
CREATE POLICY "Allow public read access"
    ON table_templates
    FOR SELECT
    USING (true);

-- Insert default templates
INSERT INTO table_templates 
    (name, shape, width, length, seats)
VALUES 
    ('Round Table (8)', 'round', 5, 5, 8),
    ('Round Table (10)', 'round', 6, 6, 10),
    ('Round Table (12)', 'round', 7, 7, 12),
    ('Rectangular Table (8)', 'rectangular', 4, 8, 8),
    ('Rectangular Table (10)', 'rectangular', 4, 10, 10),
    ('Square Table (4)', 'square', 4, 4, 4),
    ('Square Table (8)', 'square', 6, 6, 8),
    ('Oval Table (12)', 'oval', 5, 12, 12),
    ('Head Table (16)', 'rectangular', 4, 16, 16),
    ('Sweetheart Table', 'rectangular', 3, 4, 2);
