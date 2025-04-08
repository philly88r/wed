import pg from 'pg';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function checkExistingTemplates() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Get existing templates
    const existingTemplates = await client.query('SELECT * FROM table_templates');
    console.log('Existing templates:');
    console.table(existingTemplates.rows);

    // Check table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'table_templates';
    `);
    console.log('Table structure:');
    console.table(tableStructure.rows);

    // Check if there are any constraints on the shape column
    const constraints = await client.query(`
      SELECT con.conname as constraint_name,
             pg_get_constraintdef(con.oid) as constraint_def
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'table_templates'
      AND nsp.nspname = 'public';
    `);
    console.log('Constraints:');
    console.table(constraints.rows);

  } catch (error) {
    console.error('Error checking existing templates:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
checkExistingTemplates();
