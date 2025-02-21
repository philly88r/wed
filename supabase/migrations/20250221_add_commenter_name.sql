-- Add commenter_name column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' 
                 AND table_name='comments' 
                 AND column_name='commenter_name') THEN
        ALTER TABLE public.comments ADD COLUMN commenter_name text NOT NULL DEFAULT 'Anonymous';
    END IF;
END $$;
