import pg from 'pg';
const { Client } = pg;

async function updateSeatingTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    await client.connect();

    // Add created_by column to seating_tables
    await client.query(`
      ALTER TABLE seating_tables
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
    `);

    // Add created_by column to table_chairs
    await client.query(`
      ALTER TABLE table_chairs
      ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
    `);

    console.log('Successfully updated tables');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updateSeatingTables();
