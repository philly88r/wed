import pg from 'pg';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function checkTableTemplates() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Check the table structure to see allowed values for shape
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default, 
             pg_catalog.col_description(c.oid, a.attnum) as column_comment,
             pg_get_constraintdef(con.oid) as constraint_def
      FROM pg_catalog.pg_attribute a
      JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
      JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
      LEFT JOIN pg_catalog.pg_constraint con ON con.conrelid = c.oid AND a.attnum = ANY(con.conkey)
      WHERE c.relname = 'table_templates'
        AND a.attnum > 0
        AND n.nspname = 'public'
      ORDER BY a.attnum;
    `);
    
    console.log('Table structure:');
    console.table(tableInfo.rows);

    // Get existing templates
    const existingTemplates = await client.query('SELECT * FROM table_templates');
    console.log('Existing templates:');
    console.table(existingTemplates.rows);

  } catch (error) {
    console.error('Error checking table templates:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
checkTableTemplates();
