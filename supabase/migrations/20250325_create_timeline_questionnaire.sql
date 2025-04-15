-- Create timeline_questionnaire table to store all the questions and answers
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'timeline_questionnaire') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE timeline_questionnaire (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            wedding_date DATE NOT NULL,
            ceremony_venue TEXT NOT NULL,
            reception_venue TEXT,
            venue_same BOOLEAN DEFAULT false,
            ceremony_start TEXT,
            ceremony_end TEXT,
            reception_start TEXT,
            reception_end TEXT,
            first_look BOOLEAN DEFAULT false,
            first_look_time TEXT,
            first_look_location TEXT,
            photography_start TEXT,
            photography_end TEXT,
            hair_makeup_start TEXT,
            hair_makeup_location TEXT,
            transportation_details JSONB,
            meal_service_style TEXT,
            meal_details JSONB,
            special_moments JSONB,
            vendor_details JSONB,
            custom_events JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add RLS policies
        ALTER TABLE timeline_questionnaire ENABLE ROW LEVEL SECURITY;

        -- Allow read access to all authenticated users
        CREATE POLICY "Enable read access for authenticated users" ON timeline_questionnaire
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);

        -- Allow insert access to authenticated users
        CREATE POLICY "Enable insert access for authenticated users" ON timeline_questionnaire
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);

        -- Allow update access to authenticated users
        CREATE POLICY "Enable update access for authenticated users" ON timeline_questionnaire
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);

        -- Allow delete access to authenticated users
        CREATE POLICY "Enable delete access for authenticated users" ON timeline_questionnaire
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Add function to generate timeline tasks from questionnaire data
CREATE OR REPLACE FUNCTION generate_timeline_tasks_from_questionnaire()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete existing timeline tasks for this user
    DELETE FROM timeline_tasks WHERE user_id = NEW.user_id;
    
    -- Insert ceremony events
    INSERT INTO timeline_tasks (
        user_id, title, due_date, category, status, priority, "order"
    ) VALUES (
        NEW.user_id, 
        'CEREMONY START', 
        (NEW.wedding_date + NEW.ceremony_start::time)::timestamp, 
        'Ceremony', 
        'todo', 
        'high',
        10
    );
    
    IF NEW.ceremony_end IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'CEREMONY END', 
            (NEW.wedding_date + NEW.ceremony_end::time)::timestamp, 
            'Ceremony', 
            'todo', 
            'high',
            20
        );
    END IF;
    
    -- Insert reception events
    IF NEW.reception_start IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'RECEPTION START', 
            (NEW.wedding_date + NEW.reception_start::time)::timestamp, 
            'Reception', 
            'todo', 
            'high',
            30
        );
    END IF;
    
    IF NEW.reception_end IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'RECEPTION END', 
            (NEW.wedding_date + NEW.reception_end::time)::timestamp, 
            'Reception', 
            'todo', 
            'high',
            90
        );
    END IF;
    
    -- Insert first look if applicable
    IF NEW.first_look AND NEW.first_look_time IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'FIRST LOOK', 
            (NEW.wedding_date + NEW.first_look_time::time)::timestamp, 
            'Photos', 
            'todo', 
            'high',
            5
        );
    END IF;
    
    -- Insert hair and makeup if applicable
    IF NEW.hair_makeup_start IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'HMU ARRIVE', 
            (NEW.wedding_date + NEW.hair_makeup_start::time)::timestamp, 
            'Pre-Ceremony', 
            'todo', 
            'high',
            1
        );
    END IF;
    
    -- Insert photography start if applicable
    IF NEW.photography_start IS NOT NULL THEN
        INSERT INTO timeline_tasks (
            user_id, title, due_date, category, status, priority, "order"
        ) VALUES (
            NEW.user_id, 
            'PHOTOGRAPHY START', 
            (NEW.wedding_date + NEW.photography_start::time)::timestamp, 
            'Photos', 
            'todo', 
            'high',
            2
        );
    END IF;
    
    -- Insert EVENT END and LOAD OUT as the last events
    INSERT INTO timeline_tasks (
        user_id, title, due_date, category, status, priority, "order"
    ) VALUES (
        NEW.user_id, 
        'EVENT END', 
        (NEW.wedding_date + '23:59:59'::time)::timestamp, 
        'Closing', 
        'todo', 
        'high',
        100
    );
    
    INSERT INTO timeline_tasks (
        user_id, title, due_date, category, status, priority, "order", description
    ) VALUES (
        NEW.user_id, 
        'LOAD OUT', 
        (NEW.wedding_date + '23:59:59'::time)::timestamp, 
        'Closing', 
        'todo', 
        'high',
        101,
        'Cleanup and packup is complete'
    );
    
    -- Insert custom events if any
    IF NEW.custom_events IS NOT NULL THEN
        FOR i IN 0..jsonb_array_length(NEW.custom_events) - 1 LOOP
            INSERT INTO timeline_tasks (
                user_id, title, due_date, category, status, priority, "order", description
            ) VALUES (
                NEW.user_id, 
                jsonb_extract_path_text(NEW.custom_events->i, 'title'), 
                (NEW.wedding_date + (jsonb_extract_path_text(NEW.custom_events->i, 'time'))::time)::timestamp, 
                jsonb_extract_path_text(NEW.custom_events->i, 'category'), 
                'todo', 
                'medium',
                50 + i,
                jsonb_extract_path_text(NEW.custom_events->i, 'notes')
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS generate_timeline_tasks_trigger ON timeline_questionnaire;

-- Create trigger to generate timeline tasks when questionnaire is updated
CREATE TRIGGER generate_timeline_tasks_trigger
AFTER INSERT OR UPDATE ON timeline_questionnaire
FOR EACH ROW
EXECUTE FUNCTION generate_timeline_tasks_from_questionnaire();

-- Add user_id column to timeline_tasks if it doesn't exist
ALTER TABLE timeline_tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add description column to timeline_tasks if it doesn't exist
ALTER TABLE timeline_tasks 
ADD COLUMN IF NOT EXISTS description TEXT;
