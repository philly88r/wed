-- Create table_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS table_templates (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  shape VARCHAR NOT NULL,
  width INTEGER NOT NULL,
  length INTEGER NOT NULL,
  seats INTEGER NOT NULL,
  is_predefined BOOLEAN DEFAULT false
);

-- Insert predefined table templates
INSERT INTO table_templates (id, name, shape, width, length, seats, is_predefined)
VALUES 
  ('round-60', 'Round Table (60")', 'circle', 60, 60, 8, true),
  ('banquet-8x4', 'Banquet Table (8x4)', 'rectangle', 96, 48, 8, true),
  ('square-4x4', 'Square Table (4x4)', 'square', 48, 48, 8, true),
  ('oval-72x42', 'Oval Table (72x42)', 'oval', 72, 42, 8, true),
  ('serpentine', 'Serpentine Table', 'curved', 144, 48, 12, true),
  ('head-12x4', 'Head Table (12x4)', 'rectangle', 144, 48, 14, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  shape = EXCLUDED.shape,
  width = EXCLUDED.width,
  length = EXCLUDED.length,
  seats = EXCLUDED.seats,
  is_predefined = EXCLUDED.is_predefined;
