import { getSupabase } from '../supabaseClient';
import { customAlphabet } from 'nanoid';

// Create a custom nanoid generator with only easily readable characters
const generatePassword = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 12);

export interface VendorAccess {
  vendorId: string;
  accessToken: string;
  password: string;
  expiresAt: string;
}

export const generateVendorAccess = async (vendorId: string): Promise<VendorAccess | null> => {
  try {
    const password = generatePassword();
    const accessToken = generatePassword(); // Use a different token for the URL
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const supabaseClient = getSupabase();
    const { error } = await supabaseClient
      .from('vendor_access')
      .insert({
        vendor_id: vendorId,
        access_token: accessToken,
        password_hash: await hashPassword(password),
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    return {
      vendorId,
      accessToken,
      password,
      expiresAt: expiresAt.toISOString()
    };
  } catch (err) {
    console.error('Error generating vendor access:', err);
    return null;
  }
};

export const verifyVendorAccess = async (accessToken: string, password: string): Promise<string | null> => {
  try {
    console.log('Verifying access token:', accessToken);
    
    const supabaseClient = getSupabase();
    const { data, error } = await supabaseClient
      .from('vendor_access')
      .select('vendor_id, password_hash')
      .eq('access_token', accessToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    console.log('Query result:', { data, error });

    if (error || !data) return null;

    const isValidPassword = await verifyPassword(password, data.password_hash);
    console.log('Password verification:', { isValidPassword, providedPassword: password });
    
    return isValidPassword ? data.vendor_id : null;
  } catch (err) {
    console.error('Error verifying vendor access:', err);
    return null;
  }
};

// In a real application, use a proper password hashing library like bcrypt
// This is a simplified version for demonstration
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const calculatedHash = await hashPassword(password);
  console.log('Hash comparison:', { 
    calculatedHash, 
    storedHash: hash,
    match: calculatedHash === hash 
  });
  return calculatedHash === hash;
};
