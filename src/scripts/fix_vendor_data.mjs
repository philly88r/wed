import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjM0MjIsImV4cCI6MjAzMTc5OTQyMn0.Nw9JKqE-fvqiAKCgOgPZnDnD1MZfqQzMvfzGAhJrBGw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixVendorData() {
  try {
    // Get the vendor ID for Purslane Catering
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('name', 'PURSLANE CATERING')
      .single();
    
    if (vendorError) {
      throw vendorError;
    }
    
    if (!vendorData) {
      throw new Error('Vendor not found: PURSLANE CATERING');
    }
    
    console.log('Found vendor ID:', vendorData.id);
    
    // Save raw vendor data to a file for inspection
    fs.writeFileSync(
      'vendor_data_debug.json', 
      JSON.stringify(vendorData, null, 2)
    );
    console.log('Raw vendor data saved to vendor_data_debug.json');
    
    // Create a properly structured vendor object
    const structuredVendor = {
      id: vendorData.id,
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
      faq: Array.isArray(vendorData.faq) ? vendorData.faq : [],
      
      created_at: vendorData.created_at,
      updated_at: new Date().toISOString()
    };
    
    // Save structured vendor data to a file
    fs.writeFileSync(
      'structured_vendor_data.json', 
      JSON.stringify(structuredVendor, null, 2)
    );
    console.log('Structured vendor data saved to structured_vendor_data.json');
    
    // Update the vendor with the structured data
    const { error: updateError } = await supabase
      .from('vendors')
      .update(structuredVendor)
      .eq('id', vendorData.id);
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('Vendor data updated with structured fields');
    
  } catch (error) {
    console.error('Error fixing vendor data:', error);
  }
}

fixVendorData();
