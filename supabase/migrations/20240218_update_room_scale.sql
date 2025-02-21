-- Update rooms table to store AI analysis results
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS ai_scale_found boolean,
ADD COLUMN IF NOT EXISTS ai_scale_text text,
ADD COLUMN IF NOT EXISTS ai_scale_value numeric,
ADD COLUMN IF NOT EXISTS ai_pixels_per_foot numeric;

-- Create function to update table_scale from AI analysis
CREATE OR REPLACE FUNCTION update_room_scale()
RETURNS TRIGGER AS $$
BEGIN
    -- If AI found a valid scale, update table_scale
    IF NEW.ai_scale_found = true AND NEW.ai_pixels_per_foot > 0 THEN
        NEW.table_scale := NEW.ai_pixels_per_foot;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update table_scale
DROP TRIGGER IF EXISTS update_room_scale_trigger ON rooms;
CREATE TRIGGER update_room_scale_trigger
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_room_scale();
