CREATE OR REPLACE FUNCTION create_table_templates_if_not_exists()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
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
END;
$$;
