-- Create table_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_templates (
    id uuid primary key default uuid_generate_v4(),
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
    ('Sweetheart Table', 'rectangular', 3, 4, 2)
ON CONFLICT (id) DO NOTHING;
