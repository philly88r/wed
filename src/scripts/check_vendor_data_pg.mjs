import pkg from 'pg';
import fs from 'fs';
const { Pool } = pkg;

// Initialize PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkVendorData() {
  const client = await pool.connect();
  
  try {
    // Get the vendor data for Purslane Catering
    const vendorResult = await client.query(`
      SELECT * FROM vendors WHERE name = 'PURSLANE CATERING'
    `);
    
    if (vendorResult.rows.length === 0) {
      throw new Error('Vendor not found: PURSLANE CATERING');
    }
    
    const vendorData = vendorResult.rows[0];
    console.log('Vendor ID:', vendorData.id);
    console.log('Name:', vendorData.name);
    console.log('Updated At:', vendorData.updated_at);
    console.log('Is Hidden:', vendorData.is_hidden);
    console.log('Is Featured:', vendorData.is_featured);
    console.log('Contact Info:', JSON.stringify(vendorData.contact_info, null, 2));
    console.log('Social Media:', JSON.stringify(vendorData.social_media, null, 2));
    console.log('Pricing Tier:', JSON.stringify(vendorData.pricing_tier, null, 2));
    console.log('Pricing Details:', JSON.stringify(vendorData.pricing_details, null, 2));
    
    // Save the complete vendor data to a file for inspection
    fs.writeFileSync(
      'current_vendor_data.json', 
      JSON.stringify(vendorData, null, 2)
    );
    console.log('Complete vendor data saved to current_vendor_data.json');
    
  } catch (error) {
    console.error('Error checking vendor data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkVendorData();
