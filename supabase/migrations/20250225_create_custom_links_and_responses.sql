-- Create custom_links table
CREATE TABLE IF NOT EXISTS custom_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  link TEXT NOT NULL,
  questionnaire_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON custom_links
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON custom_links
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create guest_responses table
CREATE TABLE IF NOT EXISTS guest_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guest_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON guest_responses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON guest_responses
  FOR INSERT WITH CHECK (true);
