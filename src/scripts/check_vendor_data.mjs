import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Initialize Supabase client
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyMjM0MjIsImV4cCI6MjAzMTc5OTQyMn0.Nw9JKqE-fvqiAKCgOgPZnDnD1MZfqQzMvfzGAhJrBGw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVendorData() {
  try {
    // Get the vendor data for Purslane Catering
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
  }
}

checkVendorData();
