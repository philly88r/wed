import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.kdhwrlhzevzekoanusbs.supabase.co:5432/postgres'
});

async function fixVendorDataStructure() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    // First, let's check the column names in the vendors table
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
    `);
    
    console.log('Columns in vendors table:', columnsResult.rows.map(row => row.column_name));
    
    console.log('Fetching all vendors to fix data structure...');
    const vendorResult = await client.query(`
      SELECT id, name, slug, pricing_details FROM vendors
    `);
    
    if (vendorResult.rows.length === 0) {
      console.log('No vendors found to update');
      return;
    }
    
    // Process each vendor to ensure data structure consistency
    for (const vendor of vendorResult.rows) {
      console.log(`Processing vendor: ${vendor.name} (${vendor.slug})`);
      
      // Check if pricing_details exists
      if (vendor.pricing_details) {
        console.log(`Checking pricing data structure for vendor: ${vendor.name}`);
        
        // Ensure pricing_details has all required fields
        const pricingDetails = {
          tier: vendor.pricing_details.tier || 'unset',
          packages: vendor.pricing_details.packages || [],
          price_range: {
            min: vendor.pricing_details.price_range?.min || 0,
            max: vendor.pricing_details.price_range?.max || 0,
            currency: vendor.pricing_details.price_range?.currency || 'USD'
          },
          deposit_required: vendor.pricing_details.deposit_required || {
            percentage: 0,
            amount: 0,
            currency: 'USD'
          },
          payment_methods: vendor.pricing_details.payment_methods || [],
          cancellation_policy: vendor.pricing_details.cancellation_policy || ''
        };
        
        // Update the vendor with the fixed pricing_details
        await client.query(`
          UPDATE vendors 
          SET pricing_details = $1
          WHERE id = $2
        `, [pricingDetails, vendor.id]);
        
        console.log(`Updated pricing_details for vendor: ${vendor.name}`);
      } else {
        console.log(`Creating default pricing_details for vendor: ${vendor.name}`);
        
        // Create default pricing_details
        const pricingDetails = {
          tier: 'unset',
          packages: [],
          price_range: {
            min: 0,
            max: 0,
            currency: 'USD'
          },
          deposit_required: {
            percentage: 0,
            amount: 0,
            currency: 'USD'
          },
          payment_methods: [],
          cancellation_policy: ''
        };
        
        // Update the vendor with the default pricing_details
        await client.query(`
          UPDATE vendors 
          SET pricing_details = $1
          WHERE id = $2
        `, [pricingDetails, vendor.id]);
        
        console.log(`Created default pricing_details for vendor: ${vendor.name}`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Successfully fixed vendor data structure for all vendors');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error fixing vendor data structure:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    pool.end();
  }
}

fixVendorDataStructure();
