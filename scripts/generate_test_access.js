const { supabase } = require('../src/lib/supabase');
const { customAlphabet } = require('nanoid');
const crypto = require('crypto');

// Create a custom nanoid generator with only easily readable characters
const generatePassword = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);

async function generateTestAccess() {
  const vendorId = '8d3a33d0-c7f6-482c-8518-7d5f6933d57c'; // Purslane Catering
  
  try {
    const password = generatePassword();
    const accessToken = generatePassword();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from('vendor_access')
      .insert({
        vendor_id: vendorId,
        access_token: accessToken,
        password_hash: await hashPassword(password),
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    console.log('Access generated successfully!');
    console.log('----------------------------------------');
    console.log('Access Link:', `http://localhost:3000/vendor/login/${accessToken}`);
    console.log('Password:', password);
    console.log('Expires:', expiresAt.toLocaleString());
    console.log('----------------------------------------');
  } catch (err) {
    console.error('Failed to generate access:', err.message);
  }
}

// Simple password hashing (for demonstration)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

generateTestAccess();
