-- Add missing columns to timeline_tasks table if they don't exist
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'timeline_tasks') THEN
        -- Add columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'timeline_tasks' AND column_name = 'user_id') THEN
            ALTER TABLE timeline_tasks ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'timeline_tasks' AND column_name = 'priority') THEN
            ALTER TABLE timeline_tasks ADD COLUMN priority TEXT DEFAULT 'medium';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'timeline_tasks' AND column_name = 'order') THEN
            ALTER TABLE timeline_tasks ADD COLUMN "order" INTEGER DEFAULT 0;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'timeline_tasks' AND column_name = 'description') THEN
            ALTER TABLE timeline_tasks ADD COLUMN description TEXT;
        END IF;
        
        -- Create index on order column for faster sorting if it doesn't exist
        IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'timeline_tasks' AND indexname = 'timeline_tasks_order_idx') THEN
            CREATE INDEX timeline_tasks_order_idx ON timeline_tasks ("order");
        END IF;
        
        -- Update RLS policies to use user_id
        DROP POLICY IF EXISTS "Enable read access for authenticated users" ON timeline_tasks;
        CREATE POLICY "Enable read access for authenticated users" ON timeline_tasks
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL);

        DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON timeline_tasks;
        CREATE POLICY "Enable insert access for authenticated users" ON timeline_tasks
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        DROP POLICY IF EXISTS "Enable update access for authenticated users" ON timeline_tasks;
        CREATE POLICY "Enable update access for authenticated users" ON timeline_tasks
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL)
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON timeline_tasks;
        CREATE POLICY "Enable delete access for authenticated users" ON timeline_tasks
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL);
        
        -- Add comments to columns for better documentation
        COMMENT ON COLUMN timeline_tasks.user_id IS 'The user who owns this timeline task';
        COMMENT ON COLUMN timeline_tasks.priority IS 'Priority of the task: low, medium, high';
        COMMENT ON COLUMN timeline_tasks."order" IS 'Order of the task in the timeline for proper sorting';
        COMMENT ON COLUMN timeline_tasks.description IS 'Detailed description of the task';
    ELSE
        -- Create the timeline_tasks table if it doesn't exist
        CREATE TABLE timeline_tasks (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            due_date TIMESTAMP WITH TIME ZONE NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'todo',
            priority TEXT DEFAULT 'medium',
            "order" INTEGER DEFAULT 0,
            description TEXT,
            cost INTEGER,
            link TEXT,
            action_text TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index on order column for faster sorting
        CREATE INDEX timeline_tasks_order_idx ON timeline_tasks ("order");
        
        -- Enable RLS
        ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Enable read access for authenticated users" ON timeline_tasks
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL);
        
        CREATE POLICY "Enable insert access for authenticated users" ON timeline_tasks
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
        
        CREATE POLICY "Enable update access for authenticated users" ON timeline_tasks
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL)
            WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
        
        CREATE POLICY "Enable delete access for authenticated users" ON timeline_tasks
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id OR user_id IS NULL);
        
        -- Add comments to columns for better documentation
        COMMENT ON COLUMN timeline_tasks.user_id IS 'The user who owns this timeline task';
        COMMENT ON COLUMN timeline_tasks.priority IS 'Priority of the task: low, medium, high';
        COMMENT ON COLUMN timeline_tasks."order" IS 'Order of the task in the timeline for proper sorting';
        COMMENT ON COLUMN timeline_tasks.description IS 'Detailed description of the task';
    END IF;
END
$$;
