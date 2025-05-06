import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function listVendorDetails() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Search for vendors with similar names
    console.log('\nSearching for vendors with names similar to "FF":');
    const { rows: ffVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images, is_hidden
      FROM vendors
      WHERE UPPER(name) LIKE '%FF%'
      ORDER BY name
    `);
    
    ffVendors.forEach(v => {
      console.log(`- ID: ${v.id}, Name: ${v.name}, Hidden: ${v.is_hidden}`);
    });
    
    console.log('\nSearching for vendors with names similar to "ADARA":');
    const { rows: adaraVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images, is_hidden
      FROM vendors
      WHERE UPPER(name) LIKE '%ADARA%' OR UPPER(name) LIKE '%BADA%'
      ORDER BY name
    `);
    
    adaraVendors.forEach(v => {
      console.log(`- ID: ${v.id}, Name: ${v.name}, Hidden: ${v.is_hidden}`);
    });
    
    console.log('\nSearching for vendors with names similar to "FORGED IN THE NORTH":');
    const { rows: forgedVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images, is_hidden
      FROM vendors
      WHERE UPPER(name) LIKE '%FORGED%' OR UPPER(name) LIKE '%NORTH%'
      ORDER BY name
    `);
    
    forgedVendors.forEach(v => {
      const hasImages = v.gallery_images && Array.isArray(v.gallery_images) && v.gallery_images.length > 0;
      console.log(`- ID: ${v.id}, Name: ${v.name}, Has Images: ${hasImages}, Hidden: ${v.is_hidden}`);
    });
    
    // Check for foreign key relationships
    console.log('\nChecking for related tables:');
    const { rows: tables } = await client.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'vendors'
    `);
    
    tables.forEach(t => {
      console.log(`- Table: ${t.table_name}, Column: ${t.column_name}, References: vendors.${t.foreign_column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

listVendorDetails();
