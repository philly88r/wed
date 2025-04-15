-- Add priority column to timeline_tasks table
ALTER TABLE IF EXISTS timeline_tasks 
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium';

-- Add in_progress status option
-- First, create a temporary table to store the current data
CREATE TEMPORARY TABLE temp_timeline_tasks AS SELECT * FROM timeline_tasks;

-- Drop the existing table
DROP TABLE timeline_tasks;

-- Recreate the table with the updated status type
CREATE TABLE IF NOT EXISTS timeline_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    cost INTEGER,
    link TEXT,
    action_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy data back from the temporary table
INSERT INTO timeline_tasks (
    id, title, due_date, category, status, priority, cost, link, action_text, created_at, updated_at
)
SELECT 
    id, title, due_date, category, 
    CASE WHEN status = 'completed' THEN 'completed' ELSE 'todo' END,
    'medium', cost, link, action_text, created_at, updated_at
FROM temp_timeline_tasks;

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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS timeline_tasks_due_date_idx ON timeline_tasks (due_date);
CREATE INDEX IF NOT EXISTS timeline_tasks_status_idx ON timeline_tasks (status);
CREATE INDEX IF NOT EXISTS timeline_tasks_priority_idx ON timeline_tasks (priority);
