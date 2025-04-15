import pg from 'pg';
const { Client } = pg;

// Database connection configuration
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function createGuestContactsTable() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Enable UUID extension if not already enabled
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log('Enabled UUID extension');

    // Check if guest_contacts table exists
    const tableCheckQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'guest_contacts'
      );
    `;
    
    const tableCheck = await client.query(tableCheckQuery);
    
    if (tableCheck.rows[0].exists) {
      console.log('guest_contacts table already exists');
    } else {
      // Create the guest_contacts table
      const createTableQuery = `
        CREATE TABLE guest_contacts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL,
          full_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
        );
      `;
      
      await client.query(createTableQuery);
      console.log('Created guest_contacts table');
      
      // Set up Row Level Security (RLS)
      const rlsQuery = `
        ALTER TABLE guest_contacts ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own contacts" 
          ON guest_contacts 
          FOR SELECT 
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own contacts" 
          ON guest_contacts 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own contacts" 
          ON guest_contacts 
          FOR UPDATE 
          USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can delete their own contacts" 
          ON guest_contacts 
          FOR DELETE 
          USING (auth.uid() = user_id);
      `;
      
      await client.query(rlsQuery);
      console.log('Set up Row Level Security for guest_contacts table');
    }

    console.log('Guest contacts table setup completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
createGuestContactsTable();
