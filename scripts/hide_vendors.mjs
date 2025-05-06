import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function hideVendors() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // 1. Hide "FF"
    const { rowCount: ffCount } = await client.query(`
      UPDATE vendors
      SET is_hidden = true
      WHERE UPPER(name) = 'FF'
      RETURNING id, name
    `);
    console.log(`Hidden ${ffCount} vendor(s) with name "FF"`);
    
    // 2. Hide "Adara By Bada"
    const { rowCount: adaraCount } = await client.query(`
      UPDATE vendors
      SET is_hidden = true
      WHERE UPPER(name) LIKE '%ADARA%BY%BADA%'
      RETURNING id, name
    `);
    console.log(`Hidden ${adaraCount} vendor(s) with name "ADARA BY BADA"`);
    
    // 3. Handle duplicate "FORGED IN THE NORTH" - keep the one with image
    // First, check if there are duplicates
    const { rows: forgedVendors } = await client.query(`
      SELECT id, name, gallery_images
      FROM vendors
      WHERE UPPER(name) LIKE '%FORGED%IN%THE%NORTH%'
      ORDER BY name
    `);
    
    console.log(`\nFound ${forgedVendors.length} "FORGED IN THE NORTH" vendors:`);
    forgedVendors.forEach(v => {
      const hasImages = v.gallery_images && Array.isArray(v.gallery_images) && v.gallery_images.length > 0;
      console.log(`- ID: ${v.id}, Name: ${v.name}, Has Images: ${hasImages}`);
    });
    
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
      
      console.log(`\nFound ${vendorsWithImages.length} with images and ${vendorsWithoutImages.length} without images`);
      
      // If one has images, keep that one and hide the others
      if (vendorsWithImages.length > 0) {
        const keepId = vendorsWithImages[0].id;
        console.log(`Keeping vendor with ID ${keepId} (has images)`);
        
        // Hide all except the one to keep
        const { rowCount: hiddenCount } = await client.query(`
          UPDATE vendors
          SET is_hidden = true
          WHERE UPPER(name) LIKE '%FORGED%IN%THE%NORTH%'
          AND id != $1
          RETURNING id, name
        `, [keepId]);
        
        console.log(`Hidden ${hiddenCount} duplicate "FORGED IN THE NORTH" vendor(s)`);
      } else if (forgedVendors.length > 0) {
        // If none have images, keep the first one
        const keepId = forgedVendors[0].id;
        console.log(`Keeping vendor with ID ${keepId} (none have images)`);
        
        // Hide all except the first one
        const { rowCount: hiddenCount } = await client.query(`
          UPDATE vendors
          SET is_hidden = true
          WHERE UPPER(name) LIKE '%FORGED%IN%THE%NORTH%'
          AND id != $1
          RETURNING id, name
        `, [keepId]);
        
        console.log(`Hidden ${hiddenCount} duplicate "FORGED IN THE NORTH" vendor(s)`);
      }
    }
    
    // List all hidden vendors
    const { rows: hiddenVendors } = await client.query(`
      SELECT id, name, category_id
      FROM vendors
      WHERE is_hidden = true
      ORDER BY name
    `);
    
    console.log('\nCurrently hidden vendors:');
    hiddenVendors.forEach(v => {
      console.log(`- ${v.name} (ID: ${v.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

hideVendors();
