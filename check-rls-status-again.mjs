import pg from 'pg';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function checkRlsStatus() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check RLS status for seating_tables
    const seatingTablesRls = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'seating_tables';
    `);
    
    console.log('Seating Tables RLS Status:');
    console.table(seatingTablesRls.rows);

    // Check RLS status for table_chairs
    const tableChairsRls = await client.query(`
      SELECT relname, relrowsecurity
      FROM pg_class
      WHERE relname = 'table_chairs';
    `);
    
    console.log('Table Chairs RLS Status:');
    console.table(tableChairsRls.rows);

    // Check RLS policies for seating_tables
    const seatingTablesPolicies = await client.query(`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check
      FROM pg_policies
      WHERE tablename = 'seating_tables';
    `);
    
    console.log('Seating Tables RLS Policies:');
    console.table(seatingTablesPolicies.rows);

    // Check RLS policies for table_chairs
    const tableChairsPolicies = await client.query(`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check
      FROM pg_policies
      WHERE tablename = 'table_chairs';
    `);
    
    console.log('Table Chairs RLS Policies:');
    console.table(tableChairsPolicies.rows);

  } catch (error) {
    console.error('Error checking RLS status:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
checkRlsStatus();
