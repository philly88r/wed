import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleVendor() {
  try {
    // 1. Create vendor
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .insert({
        name: 'Melody Masters Entertainment',
        category_id: '051803d5-52fc-4b1d-916d-710c758b9df8',
        location: 'Philadelphia, PA',
        description: 'Professional DJ and live music entertainment services for weddings and special events.',
        contact_info: {
          email: 'contact@melodymastersent.com',
          phone: '(215) 555-0123',
          whatsapp: '12155550123',
          contact_name: 'John Smith'
        },
        social_media: {
          instagram: '@melodymastersent',
          facebook: 'melodymastersent',
          twitter: '@melodymastersent',
          website: 'https://melodymastersent.com'
        },
        business_hours: {
          monday: '9:00 AM - 5:00 PM',
          tuesday: '9:00 AM - 5:00 PM',
          wednesday: '9:00 AM - 5:00 PM',
          thursday: '9:00 AM - 5:00 PM',
          friday: '9:00 AM - 5:00 PM',
          saturday: 'By Appointment',
          sunday: 'By Appointment',
          notes: 'Available for evening consultations by appointment'
        },
        is_featured: true,
        is_hidden: false
      })
      .select()
      .single();

    if (vendorError) throw vendorError;
    console.log('Vendor created:', vendor);

    // 2. Register vendor auth
    const { error: authError } = await supabase.rpc('register_vendor', {
      vendor_id: vendor.id,
      username: 'melodymastersent',
      password: 'Welcome2024!'
    });

    if (authError) throw authError;
    console.log('Vendor auth created');

    // 3. Update services and pricing
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        services_offered: [
          {
            name: 'DJ Services',
            description: 'Professional DJ services for weddings and events',
            price_range: { min: 800, max: 2000, currency: 'USD' }
          },
          {
            name: 'Live Band',
            description: 'Live band performance for your special day',
            price_range: { min: 2500, max: 5000, currency: 'USD' }
          },
          {
            name: 'Ceremony Music',
            description: 'Live instrumental music for your ceremony',
            price_range: { min: 500, max: 1200, currency: 'USD' }
          }
        ],
        pricing_details: {
          base_price: 800,
          currency: 'USD',
          packages: [
            {
              name: 'Basic DJ Package',
              price: 800,
              description: '4 hours of DJ services, professional sound system, basic lighting',
              included_services: ['Professional DJ', 'Sound System', 'Basic Lighting']
            },
            {
              name: 'Premium DJ Package',
              price: 1500,
              description: '6 hours of DJ services, premium sound system, advanced lighting, fog machine',
              included_services: ['Professional DJ', 'Premium Sound', 'Advanced Lighting', 'Fog Machine', 'MC Services']
            },
            {
              name: 'Live Band Package',
              price: 3500,
              description: '4 hours of live band performance, includes sound system and lighting',
              included_services: ['5-Piece Band', 'Sound System', 'Stage Lighting', 'MC Services']
            }
          ]
        }
      })
      .eq('id', vendor.id);

    if (updateError) throw updateError;
    console.log('Vendor services and pricing updated');

    console.log('\nSample vendor created successfully!');
    console.log('Login credentials:');
    console.log('Username:', 'melodymastersent');
    console.log('Password:', 'Welcome2024!');
    console.log('Vendor ID:', vendor.id);

  } catch (error) {
    console.error('Error:', error);
  }
}

createSampleVendor();
