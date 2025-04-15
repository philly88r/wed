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

async function fixVendorData() {
  const client = await pool.connect();
  
  try {
    // Get the vendor ID for Purslane Catering
    const vendorResult = await client.query(`
      SELECT * FROM vendors WHERE name = 'PURSLANE CATERING'
    `);
    
    if (vendorResult.rows.length === 0) {
      throw new Error('Vendor not found: PURSLANE CATERING');
    }
    
    const vendorData = vendorResult.rows[0];
    console.log('Found vendor ID:', vendorData.id);
    
    // Save raw vendor data to a file for inspection
    fs.writeFileSync(
      'vendor_data_debug.json', 
      JSON.stringify(vendorData, null, 2)
    );
    console.log('Raw vendor data saved to vendor_data_debug.json');
    
    // Create a properly structured vendor object
    const structuredVendor = {
      // Basic info
      name: vendorData.name || '',
      slug: vendorData.slug || '',
      description: vendorData.description || '',
      location: vendorData.location || '',
      category_id: vendorData.category_id || '',
      is_featured: !!vendorData.is_featured,
      is_hidden: !!vendorData.is_hidden,
      
      // Contact info
      contact_info: {
        email: vendorData.contact_info?.email || '',
        phone: vendorData.contact_info?.phone || '',
        website: vendorData.contact_info?.website || ''
      },
      
      // Social media
      social_media: {
        instagram: vendorData.social_media?.instagram || '',
        facebook: vendorData.social_media?.facebook || '',
        website: vendorData.social_media?.website || '',
        twitter: vendorData.social_media?.twitter || ''
      },
      
      // Pricing tier
      pricing_tier: {
        tier: vendorData.pricing_tier?.tier || 'budget',
        avg_price: vendorData.pricing_tier?.avg_price || null
      },
      
      // Pricing details
      pricing_details: {
        tier: vendorData.pricing_details?.tier || 'unset',
        packages: Array.isArray(vendorData.pricing_details?.packages) ? vendorData.pricing_details.packages : [],
        price_range: {
          min: vendorData.pricing_details?.price_range?.min || 0,
          max: vendorData.pricing_details?.price_range?.max || 0,
          currency: vendorData.pricing_details?.price_range?.currency || 'USD'
        }
      },
      
      // Availability
      availability: {
        lead_time_days: vendorData.availability?.lead_time_days || 0,
        peak_season: Array.isArray(vendorData.availability?.peak_season) ? vendorData.availability.peak_season : [],
        off_peak_season: Array.isArray(vendorData.availability?.off_peak_season) ? vendorData.availability.off_peak_season : []
      },
      
      // Services and amenities
      services_offered: Array.isArray(vendorData.services_offered) ? vendorData.services_offered : [],
      amenities: vendorData.amenities || {},
      gallery_images: Array.isArray(vendorData.gallery_images) ? vendorData.gallery_images : [],
      faq: Array.isArray(vendorData.faq) ? vendorData.faq : []
    };
    
    // Save structured vendor data to a file
    fs.writeFileSync(
      'structured_vendor_data.json', 
      JSON.stringify(structuredVendor, null, 2)
    );
    console.log('Structured vendor data saved to structured_vendor_data.json');
    
    // Update the vendor with the structured data
    await client.query(`
      UPDATE vendors 
      SET 
        contact_info = $1,
        social_media = $2,
        pricing_tier = $3,
        pricing_details = $4,
        availability = $5,
        services_offered = $6,
        amenities = $7,
        gallery_images = $8,
        faq = $9,
        updated_at = NOW()
      WHERE id = $10
    `, [
      JSON.stringify(structuredVendor.contact_info),
      JSON.stringify(structuredVendor.social_media),
      JSON.stringify(structuredVendor.pricing_tier),
      JSON.stringify(structuredVendor.pricing_details),
      JSON.stringify(structuredVendor.availability),
      JSON.stringify(structuredVendor.services_offered),
      JSON.stringify(structuredVendor.amenities),
      JSON.stringify(structuredVendor.gallery_images),
      JSON.stringify(structuredVendor.faq),
      vendorData.id
    ]);
    
    console.log('Vendor data updated with structured fields');
    
  } catch (error) {
    console.error('Error fixing vendor data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixVendorData();
