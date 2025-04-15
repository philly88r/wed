-- Create guest_contacts table
CREATE TABLE IF NOT EXISTS guest_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guest_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON guest_contacts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users" ON guest_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users" ON guest_contacts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for authenticated users" ON guest_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX guest_contacts_user_id_idx ON guest_contacts(user_id);
CREATE INDEX guest_contacts_phone_idx ON guest_contacts(phone);
CREATE INDEX guest_contacts_email_idx ON guest_contacts(email);
