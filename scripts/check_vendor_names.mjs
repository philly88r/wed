import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkVendorNames() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Search for vendors with similar names
    console.log('\nSearching for vendors with names similar to "FF":');
    const { rows: ffVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images
      FROM vendors
      WHERE name ILIKE 'FF%' OR name ILIKE '%FF%'
      ORDER BY name
    `);
    
    ffVendors.forEach(v => {
      console.log(`- ID: ${v.id}, Name: ${v.name}`);
    });
    
    console.log('\nSearching for vendors with names similar to "ADARA":');
    const { rows: adaraVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images
      FROM vendors
      WHERE name ILIKE '%ADARA%' OR name ILIKE '%BADA%'
      ORDER BY name
    `);
    
    adaraVendors.forEach(v => {
      console.log(`- ID: ${v.id}, Name: ${v.name}`);
    });
    
    console.log('\nSearching for vendors with names similar to "FORGED IN THE NORTH":');
    const { rows: forgedVendors } = await client.query(`
      SELECT id, name, category_id, gallery_images
      FROM vendors
      WHERE name ILIKE '%FORGED%' OR name ILIKE '%NORTH%'
      ORDER BY name
    `);
    
    forgedVendors.forEach(v => {
      const hasImages = v.gallery_images && Array.isArray(v.gallery_images) && v.gallery_images.length > 0;
      console.log(`- ID: ${v.id}, Name: ${v.name}, Has Images: ${hasImages}`);
    });
    
    // List all vendors for reference
    console.log('\nListing all vendors (first 20):');
    const { rows: allVendors } = await client.query(`
      SELECT id, name
      FROM vendors
      ORDER BY name
      LIMIT 20
    `);
    
    allVendors.forEach(v => {
      console.log(`- ${v.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkVendorNames();
