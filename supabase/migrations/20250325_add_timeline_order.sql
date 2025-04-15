-- Add order column to timeline_tasks table
ALTER TABLE timeline_tasks 
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add comment explaining the order field
COMMENT ON COLUMN timeline_tasks.order IS 'Order of the task in the timeline, used for sorting';

-- Create an index on the order column for faster sorting
CREATE INDEX IF NOT EXISTS timeline_tasks_order_idx ON timeline_tasks ("order");
