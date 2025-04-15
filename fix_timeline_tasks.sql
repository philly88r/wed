-- Fix null due dates in timeline_tasks table
-- Run this script in your Supabase SQL editor

-- Update any existing tasks with null due_dates to use a default date (30 days from now)
UPDATE timeline_tasks
SET due_date = NOW() + INTERVAL '30 days'
WHERE due_date IS NULL;

-- Alter the timeline_tasks table to set a default value for due_date
ALTER TABLE timeline_tasks 
ALTER COLUMN due_date SET DEFAULT NOW() + INTERVAL '30 days';

-- Create a trigger function to ensure due_date is never null
CREATE OR REPLACE FUNCTION ensure_due_date_not_null()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.due_date IS NULL THEN
    NEW.due_date := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that runs before insert or update
DROP TRIGGER IF EXISTS ensure_due_date_trigger ON timeline_tasks;
CREATE TRIGGER ensure_due_date_trigger
BEFORE INSERT OR UPDATE ON timeline_tasks
FOR EACH ROW
EXECUTE FUNCTION ensure_due_date_not_null();
