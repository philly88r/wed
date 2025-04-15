import pg from 'pg';
const { Client } = pg;

async function checkTables() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    await client.connect();

    // Check seating_tables structure
    console.log('\nSeating Tables Structure:');
    const tablesStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'seating_tables'
      ORDER BY ordinal_position;
    `);
    console.table(tablesStructure.rows);

    // Check table_chairs structure
    console.log('\nTable Chairs Structure:');
    const chairsStructure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'table_chairs'
      ORDER BY ordinal_position;
    `);
    console.table(chairsStructure.rows);

    // Sample of actual data
    console.log('\nTable and Chair Data:');
    const data = await client.query(`
      SELECT 
        t.id as table_id,
        t.name as table_name,
        t.created_by as table_created_by,
        COUNT(c.id) as chair_count,
        COUNT(c.guest_id) as seated_guests
      FROM seating_tables t
      LEFT JOIN table_chairs c ON t.id = c.table_id
      GROUP BY t.id, t.name, t.created_by;
    `);
    console.table(data.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTables();
