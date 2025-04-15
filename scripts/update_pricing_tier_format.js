import pg from 'pg';
const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.kdhwrlhzevzekoanusbs.supabase.co:5432/postgres'
});

async function updatePricingTierFormat() {
  const client = await pool.connect();
  
  try {
    // Start a transaction
    await client.query('BEGIN');
    
    console.log('Fetching all vendors to update pricing tier format...');
    const vendorResult = await client.query(`
      SELECT id, name, slug, pricing_details FROM vendors
    `);
    
    if (vendorResult.rows.length === 0) {
      console.log('No vendors found to update');
      return;
    }
    
    // Process each vendor to update pricing tier format
    for (const vendor of vendorResult.rows) {
      console.log(`Processing vendor: ${vendor.name} (${vendor.slug})`);
      
      if (vendor.pricing_details) {
        console.log(`Updating pricing tier format for vendor: ${vendor.name}`);
        
        // Convert current pricing tier to $, $$, or $$$ format
        let dollarSignTier = '$';
        
        if (vendor.pricing_details.tier) {
          const currentTier = vendor.pricing_details.tier.toLowerCase();
          
          if (currentTier === 'budget' || currentTier === 'low') {
            dollarSignTier = '$';
          } else if (currentTier === 'mid_range' || currentTier === 'medium') {
            dollarSignTier = '$$';
          } else if (currentTier === 'premium' || currentTier === 'high' || currentTier === 'luxury') {
            dollarSignTier = '$$$';
          }
        } else if (vendor.pricing_details.price_range) {
          // If no tier but has price range, determine tier based on price range
          const maxPrice = vendor.pricing_details.price_range.max || 0;
          
          if (maxPrice <= 1000) {
            dollarSignTier = '$';
          } else if (maxPrice <= 3000) {
            dollarSignTier = '$$';
          } else {
            dollarSignTier = '$$$';
          }
        }
        
        // Update pricing_details with the new tier format
        const updatedPricingDetails = {
          ...vendor.pricing_details,
          tier: dollarSignTier
        };
        
        // Update the vendor with the new pricing tier format
        await client.query(`
          UPDATE vendors 
          SET pricing_details = $1
          WHERE id = $2
        `, [updatedPricingDetails, vendor.id]);
        
        console.log(`Updated pricing tier to "${dollarSignTier}" for vendor: ${vendor.name}`);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log('Successfully updated pricing tier format for all vendors');
  } catch (error) {
    // Rollback in case of error
    await client.query('ROLLBACK');
    console.error('Error updating pricing tier format:', error);
  } finally {
    // Release the client back to the pool
    client.release();
    pool.end();
  }
}

updatePricingTierFormat();
