-- Create timeline_tasks table
CREATE TABLE IF NOT EXISTS timeline_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo',
    cost INTEGER,
    link TEXT,
    action_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for authenticated users" ON timeline_tasks
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Enable insert access for authenticated users" ON timeline_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Enable update access for authenticated users" ON timeline_tasks
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow delete access to authenticated users
CREATE POLICY "Enable delete access for authenticated users" ON timeline_tasks
    FOR DELETE
    TO authenticated
    USING (true);
