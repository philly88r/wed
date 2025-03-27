import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyzcompany.supabase.co';
const supabaseKey = 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createVendorLogin() {
  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'purslane@example.com',
      password: 'Purslane123!',
      user_metadata: {
        is_vendor: true,
        vendor_id: '8d3a33d0-c7f6-482c-8518-7d5f6933d57c' // Purslane Catering's ID
      }
    });

    if (authError) throw authError;

    console.log('Vendor login created successfully!');
    console.log('Email:', 'purslane@example.com');
    console.log('Password:', 'Purslane123!');
    console.log('Vendor ID:', '8d3a33d0-c7f6-482c-8518-7d5f6933d57c');

  } catch (error) {
    console.error('Error creating vendor login:', error.message);
  }
}

createVendorLogin();
