-- Add created_by column to guests table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.guests ADD COLUMN created_by UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid();
  END IF;
END
$$;
