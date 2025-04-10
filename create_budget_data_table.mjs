// Script to create the budget_data table in the database
import pg from 'pg';
const { Client } = pg;

// Database connection string from previous scripts
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function createBudgetDataTable() {
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
        AND table_name = 'budget_data'
      );
    `;
    
    const tableExists = await client.query(checkTableQuery);
    
    if (tableExists.rows[0].exists) {
      console.log('The budget_data table already exists');
    } else {
      // Create the budget_data table
      const createTableQuery = `
        CREATE TABLE public.budget_data (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES auth.users(id),
          total_budget NUMERIC NOT NULL DEFAULT 0,
          guest_count INTEGER NOT NULL DEFAULT 0,
          essential_categories JSONB NOT NULL DEFAULT '{}',
          discretionary_categories JSONB NOT NULL DEFAULT '{}',
          disabled_vendors JSONB NOT NULL DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      await client.query(createTableQuery);
      console.log('Created budget_data table');
      
      // Create RLS policies
      const enableRLSQuery = `
        ALTER TABLE public.budget_data ENABLE ROW LEVEL SECURITY;
      `;
      
      await client.query(enableRLSQuery);
      console.log('Enabled Row Level Security on budget_data table');
      
      // Create policy for selecting records
      const createSelectPolicyQuery = `
        CREATE POLICY "Users can view their own budget data" 
        ON public.budget_data 
        FOR SELECT 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createSelectPolicyQuery);
      console.log('Created SELECT policy');
      
      // Create policy for inserting records
      const createInsertPolicyQuery = `
        CREATE POLICY "Users can insert their own budget data" 
        ON public.budget_data 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
      `;
      
      await client.query(createInsertPolicyQuery);
      console.log('Created INSERT policy');
      
      // Create policy for updating records
      const createUpdatePolicyQuery = `
        CREATE POLICY "Users can update their own budget data" 
        ON public.budget_data 
        FOR UPDATE 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createUpdatePolicyQuery);
      console.log('Created UPDATE policy');
      
      // Create policy for deleting records
      const createDeletePolicyQuery = `
        CREATE POLICY "Users can delete their own budget data" 
        ON public.budget_data 
        FOR DELETE 
        USING (auth.uid() = user_id);
      `;
      
      await client.query(createDeletePolicyQuery);
      console.log('Created DELETE policy');
      
      // Create index on user_id for faster lookups
      const createIndexQuery = `
        CREATE INDEX budget_data_user_id_idx ON public.budget_data (user_id);
      `;
      
      await client.query(createIndexQuery);
      console.log('Created index on user_id');
    }

    console.log('Budget data table setup complete');
  } catch (error) {
    console.error('Error setting up budget_data table:', error);
  } finally {
    await client.end();
    console.log('Disconnected from the database');
  }
}

createBudgetDataTable();
