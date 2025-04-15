import pg from 'pg';
const { Client } = pg;

async function checkTemplates() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres'
  });

  try {
    await client.connect();

    // Check table_templates structure
    console.log('\nTable Templates Structure:');
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'table_templates'
      ORDER BY ordinal_position;
    `);
    structure.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check table_templates data
    console.log('\nTable Templates Data:');
    const data = await client.query(`
      SELECT *
      FROM table_templates
      ORDER BY name;
    `);
    data.rows.forEach(row => {
      console.log(`\nTemplate: ${row.name}`);
      console.log(`- ID: ${row.id}`);
      console.log(`- Shape: ${row.shape}`);
      console.log(`- Seats: ${row.seats}`);
      console.log(`- Width: ${row.width}`);
      console.log(`- Length: ${row.length}`);
      console.log(`- Is Predefined: ${row.is_predefined}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTemplates();
