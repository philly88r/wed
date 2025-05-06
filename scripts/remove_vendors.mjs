import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function removeVendors() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Check for vendors to be removed
    console.log('Checking for vendors to remove...');
    
    // 1. Remove "FF"
    const { rowCount: ffCount } = await client.query(`
      DELETE FROM vendors
      WHERE UPPER(name) = 'FF'
      RETURNING id
    `);
    console.log(`Removed ${ffCount} vendor(s) with name "FF"`);
    
    // 2. Remove "Adara By Bada"
    const { rowCount: adaraCount } = await client.query(`
      DELETE FROM vendors
      WHERE UPPER(name) = 'ADARA BY BADA'
      RETURNING id
    `);
    console.log(`Removed ${adaraCount} vendor(s) with name "ADARA BY BADA"`);
    
    // 3. Handle duplicate "FORGED IN THE NORTH" - keep the one with image
    // First, check if there are duplicates
    const { rows: forgedVendors } = await client.query(`
      SELECT id, name, gallery_images
      FROM vendors
      WHERE UPPER(name) = 'FORGED IN THE NORTH'
      OR UPPER(name) = 'FORGED IN THE NORTH (BROOKLYN)'
    `);
    
    console.log(`Found ${forgedVendors.length} "FORGED IN THE NORTH" vendors`);
    
    if (forgedVendors.length > 1) {
      // Find the one with images (non-empty gallery_images array)
      const vendorsWithImages = forgedVendors.filter(v => 
        v.gallery_images && 
        Array.isArray(v.gallery_images) && 
        v.gallery_images.length > 0
      );
      
      const vendorsWithoutImages = forgedVendors.filter(v => 
        !v.gallery_images || 
        !Array.isArray(v.gallery_images) || 
        v.gallery_images.length === 0
      );
      
      console.log(`Found ${vendorsWithImages.length} with images and ${vendorsWithoutImages.length} without images`);
      
      // Keep the one with images, delete the others
      if (vendorsWithImages.length > 0) {
        const keepId = vendorsWithImages[0].id;
        console.log(`Keeping vendor with ID ${keepId} (has images)`);
        
        // Delete all except the one to keep
        const { rowCount: deletedCount } = await client.query(`
          DELETE FROM vendors
          WHERE (UPPER(name) = 'FORGED IN THE NORTH' OR UPPER(name) = 'FORGED IN THE NORTH (BROOKLYN)')
          AND id != $1
          RETURNING id
        `, [keepId]);
        
        console.log(`Removed ${deletedCount} duplicate "FORGED IN THE NORTH" vendor(s)`);
      } else {
        // If none have images, keep the first one
        const keepId = forgedVendors[0].id;
        console.log(`Keeping vendor with ID ${keepId} (none have images)`);
        
        // Delete all except the first one
        const { rowCount: deletedCount } = await client.query(`
          DELETE FROM vendors
          WHERE (UPPER(name) = 'FORGED IN THE NORTH' OR UPPER(name) = 'FORGED IN THE NORTH (BROOKLYN)')
          AND id != $1
          RETURNING id
        `, [keepId]);
        
        console.log(`Removed ${deletedCount} duplicate "FORGED IN THE NORTH" vendor(s)`);
      }
    }
    
    // Summary of all vendors in the database
    const { rows: categories } = await client.query(`
      SELECT vc.name as category, COUNT(v.id) as count
      FROM vendors v
      JOIN vendor_categories vc ON v.category_id = vc.id
      GROUP BY vc.name
      ORDER BY vc.name
    `);
    
    console.log('\nCurrent vendor counts by category:');
    categories.forEach(cat => {
      console.log(`- ${cat.category}: ${cat.count} vendors`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

removeVendors();
