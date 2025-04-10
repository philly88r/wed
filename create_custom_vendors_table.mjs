// Script to create the custom_vendors table in the database
import pg from 'pg';
const { Client } = pg;

// Database connection string from previous scripts
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function createCustomVendorsTable() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to the database');

    // Check if table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'custom_vendors'
      );
    `;
    
    const tableExists = await client.query(checkTableQuery);
    
    if (tableExists.rows[0].exists) {
      console.log('The custom_vendors table already exists');
    } else {
      // Create the custom_vendors table
      const createTableQuery = `
        CREATE TABLE public.custom_vendors (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          name TEXT NOT NULL,
          allocated NUMERIC NOT NULL DEFAULT 0,
          spent NUMERIC NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      await client.query(createTableQuery);
      console.log('Created custom_vendors table');
      
      // Create RLS policies
      const enableRLSQuery = `
        ALTER TABLE public.custom_vendors ENABLE ROW LEVEL SECURITY;
      `;
      
      await client.query(enableRLSQuery);
      console.log('Enabled Row Level Security on custom_vendors table');
      
      // Create policy for selecting records
      const createSelectPolicyQuery = `
        CREATE POLICY "Users can view their own custom vendors" 
        ON public.custom_vendors 
        FOR SELECT 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createSelectPolicyQuery);
      console.log('Created SELECT policy');
      
      // Create policy for inserting records
      const createInsertPolicyQuery = `
        CREATE POLICY "Users can insert their own custom vendors" 
        ON public.custom_vendors 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
      `;
      
      await client.query(createInsertPolicyQuery);
      console.log('Created INSERT policy');
      
      // Create policy for updating records
      const createUpdatePolicyQuery = `
        CREATE POLICY "Users can update their own custom vendors" 
        ON public.custom_vendors 
        FOR UPDATE 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createUpdatePolicyQuery);
      console.log('Created UPDATE policy');
      
      // Create policy for deleting records
      const createDeletePolicyQuery = `
        CREATE POLICY "Users can delete their own custom vendors" 
        ON public.custom_vendors 
        FOR DELETE 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createDeletePolicyQuery);
      console.log('Created DELETE policy');
    }

    console.log('Custom vendors table setup complete');
  } catch (error) {
    console.error('Error setting up custom_vendors table:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

createCustomVendorsTable();
