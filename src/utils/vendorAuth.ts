import { supabase } from '../lib/supabase';
import { VendorRegistrationData, VendorAuthResponse } from '../types/vendorAuth';

export const registerVendor = async (data: VendorRegistrationData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .rpc('register_vendor', {
        vendor_id: data.vendor_id,
        username: data.username,
        password: data.password
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error registering vendor:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to register vendor' 
    };
  }
};

export const authenticateVendor = async (
  username: string, 
  password: string
): Promise<{ success: boolean; vendorId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .rpc('authenticate_vendor', {
        input_username: username,
        input_password: password
      });

    if (error) throw error;

    const authResponse = data as VendorAuthResponse[];
    if (!authResponse?.[0]?.is_valid) {
      return { 
        success: false, 
        error: 'Invalid credentials' 
      };
    }

    return { 
      success: true, 
      vendorId: authResponse[0].vendor_id 
    };
  } catch (error: any) {
    console.error('Error authenticating vendor:', error);
    return { 
      success: false, 
      error: error.message || 'Authentication failed' 
    };
  }
};

// Generate a temporary password for new vendors
export const generateTempPassword = (): string => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};
