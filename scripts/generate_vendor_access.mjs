import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xyzcompany.supabase.co',  // Replace with your Supabase URL
  'your-service-role-key'            // Replace with your service role key
);

async function generateVendorAccess() {
  const vendorId = '8d3a33d0-c7f6-482c-8518-7d5f6933d57c'; // Purslane Catering
  const accessToken = 'PURSLANE123';  // Simple test token
  const password = 'TEST456';         // Simple test password
  
  // Hash the password (simple SHA-256 for testing)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const passwordHash = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Set expiration to 7 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    const { error } = await supabase
      .from('vendor_access')
      .insert({
        vendor_id: vendorId,
        access_token: accessToken,
        password_hash: passwordHash,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    console.log('Vendor access generated successfully!');
    console.log('----------------------------------------');
    console.log('Access Link:', `http://localhost:3000/vendor/login/${accessToken}`);
    console.log('Password:', password);
    console.log('Expires:', expiresAt.toLocaleString());
    console.log('----------------------------------------');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

generateVendorAccess();
