-- Create table_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_templates (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    shape text not null check (shape in ('round', 'rectangular', 'square', 'oval')),
    width numeric not null,
    length numeric not null,
    seats integer not null,
    is_premium boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE table_templates ENABLE ROW LEVEL SECURITY;

-- Allow public access for now
CREATE POLICY "Allow public read access"
    ON table_templates
    FOR SELECT
    USING (true);

-- Insert default templates
INSERT INTO table_templates 
    (name, shape, width, length, seats, is_premium)
VALUES 
    ('Round Table (8)', 'round', 5, 5, 8, false),
    ('Round Table (10)', 'round', 6, 6, 10, false),
    ('Round Table (12)', 'round', 7, 7, 12, false),
    ('Rectangular Table (8)', 'rectangular', 4, 8, 8, false),
    ('Rectangular Table (10)', 'rectangular', 4, 10, 10, false),
    ('Square Table (4)', 'square', 4, 4, 4, false),
    ('Square Table (8)', 'square', 6, 6, 8, false),
    ('Oval Table (12)', 'oval', 5, 12, 12, true),
    ('Head Table (16)', 'rectangular', 4, 16, 16, true),
    ('Sweetheart Table', 'rectangular', 3, 4, 2, true)
ON CONFLICT (id) DO NOTHING;
