// Import the Supabase client
const { createClient } = require('@supabase/supabase-js');

// Use the direct connection credentials
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY4MDU2NjQwMCwiZXhwIjoxOTk2MTQyNDAwfQ.AUGv5NJhAOjIZjS4-3pU6qU0K8S3DjOvV8A34ydGsGg';

// Create a Supabase client with the service role key for admin access
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSeatingTables() {
  try {
    console.log('Checking and fixing seating_tables table...');
    
    // First, run a query to check if the table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'seating_tables')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.error('Error checking if table exists:', tableError);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('seating_tables table does not exist. Creating it...');
      
      // Create the table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_seating_tables');
      
      if (createError) {
        console.error('Error creating table:', createError);
        return;
      }
      
      console.log('Created seating_tables table');
    }
    
    // Execute RPC function to add the length column if it doesn't exist
    const { data: lengthResult, error: lengthError } = await supabase.rpc('add_length_column_if_not_exists');
    
    if (lengthError) {
      console.error('Error adding length column:', lengthError);
      
      // If the RPC function doesn't exist, we'll need to create it first
      console.log('Creating RPC function to add length column...');
      
      const createRpcQuery = `
        CREATE OR REPLACE FUNCTION add_length_column_if_not_exists()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'seating_tables'
            AND column_name = 'length'
          ) THEN
            ALTER TABLE seating_tables ADD COLUMN length NUMERIC DEFAULT 100;
            UPDATE seating_tables SET length = 100 WHERE length IS NULL;
            RAISE NOTICE 'Added length column to seating_tables table';
          ELSE
            RAISE NOTICE 'Length column already exists in seating_tables table';
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createFuncError } = await supabase.rpc('exec_sql', { sql: createRpcQuery });
      
      if (createFuncError) {
        console.error('Error creating RPC function:', createFuncError);
        
        // Direct SQL approach as fallback
        console.log('Trying direct SQL approach...');
        
        // Use raw SQL to add the column
        const { error: sqlError } = await supabase.rpc('exec_sql', { 
          sql: "ALTER TABLE IF EXISTS seating_tables ADD COLUMN IF NOT EXISTS length NUMERIC DEFAULT 100;" 
        });
        
        if (sqlError) {
          console.error('Error executing direct SQL:', sqlError);
        } else {
          console.log('Successfully added length column using direct SQL');
        }
      } else {
        // Now call the function
        const { error: callError } = await supabase.rpc('add_length_column_if_not_exists');
        
        if (callError) {
          console.error('Error calling RPC function:', callError);
        } else {
          console.log('Successfully added length column');
        }
      }
    } else {
      console.log('Length column operation completed successfully');
    }
    
    // Similar process for width column
    const { data: widthResult, error: widthError } = await supabase.rpc('add_width_column_if_not_exists');
    
    if (widthError) {
      console.log('Creating RPC function to add width column...');
      
      const createWidthRpcQuery = `
        CREATE OR REPLACE FUNCTION add_width_column_if_not_exists()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'seating_tables'
            AND column_name = 'width'
          ) THEN
            ALTER TABLE seating_tables ADD COLUMN width NUMERIC DEFAULT 100;
            UPDATE seating_tables SET width = 100 WHERE width IS NULL;
            RAISE NOTICE 'Added width column to seating_tables table';
          ELSE
            RAISE NOTICE 'Width column already exists in seating_tables table';
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createWidthFuncError } = await supabase.rpc('exec_sql', { sql: createWidthRpcQuery });
      
      if (createWidthFuncError) {
        console.error('Error creating width RPC function:', createWidthFuncError);
        
        // Direct SQL approach as fallback
        console.log('Trying direct SQL approach for width column...');
        
        // Use raw SQL to add the column
        const { error: sqlWidthError } = await supabase.rpc('exec_sql', { 
          sql: "ALTER TABLE IF EXISTS seating_tables ADD COLUMN IF NOT EXISTS width NUMERIC DEFAULT 100;" 
        });
        
        if (sqlWidthError) {
          console.error('Error executing direct SQL for width column:', sqlWidthError);
        } else {
          console.log('Successfully added width column using direct SQL');
        }
      } else {
        // Now call the function
        const { error: callWidthError } = await supabase.rpc('add_width_column_if_not_exists');
        
        if (callWidthError) {
          console.error('Error calling width RPC function:', callWidthError);
        } else {
          console.log('Successfully added width column');
        }
      }
    } else {
      console.log('Width column operation completed successfully');
    }
    
    console.log('Database migration completed');
  } catch (error) {
    console.error('Unexpected error during migration:', error);
  }
}

// Run the migration
fixSeatingTables();
