import pg from 'pg';
const { Client } = pg;

// Database connection configuration
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

async function updateCustomLinksTable() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to the database');

    // Check if user_id column exists
    const checkColumnQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'custom_links' 
        AND column_name = 'user_id'
      );
    `;
    
    const columnCheck = await client.query(checkColumnQuery);
    
    if (columnCheck.rows[0].exists) {
      console.log('user_id column already exists in custom_links table');
    } else {
      // Add user_id column to custom_links table
      const addColumnQuery = `
        ALTER TABLE custom_links 
        ADD COLUMN user_id UUID REFERENCES auth.users(id);
      `;
      
      await client.query(addColumnQuery);
      console.log('Added user_id column to custom_links table');
    }

    // Show the updated table structure
    const tableStructureQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'custom_links';
    `;
    
    const tableStructure = await client.query(tableStructureQuery);
    console.log('Updated custom_links table structure:');
    console.log(tableStructure.rows);

    // Add RLS policies to secure the custom_links table
    const addRlsQuery = `
      -- Enable RLS on the table
      ALTER TABLE custom_links ENABLE ROW LEVEL SECURITY;
      
      -- Create policy to allow users to view only their own links
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'custom_links' AND policyname = 'Users can view their own links'
        ) THEN
          CREATE POLICY "Users can view their own links" 
            ON custom_links 
            FOR SELECT 
            USING (auth.uid() = user_id OR user_id IS NULL);
        END IF;
      END
      $$;
      
      -- Create policy to allow users to insert their own links
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'custom_links' AND policyname = 'Users can insert their own links'
        ) THEN
          CREATE POLICY "Users can insert their own links" 
            ON custom_links 
            FOR INSERT 
            WITH CHECK (auth.uid() = user_id);
        END IF;
      END
      $$;
      
      -- Create policy to allow users to update their own links
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'custom_links' AND policyname = 'Users can update their own links'
        ) THEN
          CREATE POLICY "Users can update their own links" 
            ON custom_links 
            FOR UPDATE 
            USING (auth.uid() = user_id);
        END IF;
      END
      $$;
      
      -- Create policy to allow users to delete their own links
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE tablename = 'custom_links' AND policyname = 'Users can delete their own links'
        ) THEN
          CREATE POLICY "Users can delete their own links" 
            ON custom_links 
            FOR DELETE 
            USING (auth.uid() = user_id);
        END IF;
      END
      $$;
    `;
    
    await client.query(addRlsQuery);
    console.log('Added Row Level Security policies to custom_links table');

    console.log('Custom links table updated successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
updateCustomLinksTable();
