import pg from 'pg';
const { Client } = pg;

async function updateExistingTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    await client.connect();

    // Get all users
    const users = await client.query(`
      SELECT id FROM auth.users LIMIT 1;
    `);

    if (users.rows.length === 0) {
      console.log('No users found');
      return;
    }

    const userId = users.rows[0].id;
    console.log(`Using user ID: ${userId}`);

    // Update all existing tables
    const updateTables = await client.query(`
      UPDATE seating_tables 
      SET created_by = $1
      WHERE created_by IS NULL
      RETURNING id;
    `, [userId]);
    console.log(`Updated ${updateTables.rowCount} tables`);

    // Update all existing chairs
    const updateChairs = await client.query(`
      UPDATE table_chairs 
      SET created_by = $1
      WHERE created_by IS NULL
      RETURNING id;
    `, [userId]);
    console.log(`Updated ${updateChairs.rowCount} chairs`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

updateExistingTables();
