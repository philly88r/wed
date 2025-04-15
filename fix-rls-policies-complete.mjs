import pg from 'pg';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function fixRlsPolicies() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Step 1: Drop all existing policies for seating_tables
    console.log('Dropping existing policies for seating_tables...');
    await client.query(`
      DO $$
      DECLARE
          pol RECORD;
      BEGIN
          FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'seating_tables'
          LOOP
              EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON seating_tables';
          END LOOP;
      END $$;
    `);

    // Step 2: Drop all existing policies for table_chairs
    console.log('Dropping existing policies for table_chairs...');
    await client.query(`
      DO $$
      DECLARE
          pol RECORD;
      BEGIN
          FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'table_chairs'
          LOOP
              EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON table_chairs';
          END LOOP;
      END $$;
    `);

    // Step 3: Disable RLS for seating_tables
    console.log('Disabling RLS for seating_tables...');
    await client.query(`
      ALTER TABLE seating_tables DISABLE ROW LEVEL SECURITY;
    `);

    // Step 4: Disable RLS for table_chairs
    console.log('Disabling RLS for table_chairs...');
    await client.query(`
      ALTER TABLE table_chairs DISABLE ROW LEVEL SECURITY;
    `);

    // Step 5: Create permissive policies for seating_tables
    console.log('Creating permissive policies for seating_tables...');
    await client.query(`
      CREATE POLICY seating_tables_all_operations
      ON seating_tables
      USING (true)
      WITH CHECK (true);
    `);

    // Step 6: Create permissive policies for table_chairs
    console.log('Creating permissive policies for table_chairs...');
    await client.query(`
      CREATE POLICY table_chairs_all_operations
      ON table_chairs
      USING (true)
      WITH CHECK (true);
    `);

    // Step 7: Re-enable RLS for seating_tables with permissive policy
    console.log('Re-enabling RLS for seating_tables with permissive policy...');
    await client.query(`
      ALTER TABLE seating_tables ENABLE ROW LEVEL SECURITY;
    `);

    // Step 8: Re-enable RLS for table_chairs with permissive policy
    console.log('Re-enabling RLS for table_chairs with permissive policy...');
    await client.query(`
      ALTER TABLE table_chairs ENABLE ROW LEVEL SECURITY;
    `);

    console.log('Successfully fixed RLS policies for seating_tables and table_chairs');

    // Verify the changes
    console.log('\nVerifying changes:');
    
    // Check RLS status for seating_tables
    const seatingTablesRls = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'seating_tables';
    `);
    
    console.log('Seating Tables RLS Status:');
    console.table(seatingTablesRls.rows);

    // Check RLS policies for seating_tables
    const seatingTablesPolicies = await client.query(`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd
      FROM pg_policies
      WHERE tablename = 'seating_tables';
    `);
    
    console.log('Seating Tables RLS Policies:');
    console.table(seatingTablesPolicies.rows);

    // Check RLS status for table_chairs
    const tableChairsRls = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'table_chairs';
    `);
    
    console.log('Table Chairs RLS Status:');
    console.table(tableChairsRls.rows);

    // Check RLS policies for table_chairs
    const tableChairsPolicies = await client.query(`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd
      FROM pg_policies
      WHERE tablename = 'table_chairs';
    `);
    
    console.log('Table Chairs RLS Policies:');
    console.table(tableChairsPolicies.rows);

  } catch (error) {
    console.error('Error fixing RLS policies:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
fixRlsPolicies();
