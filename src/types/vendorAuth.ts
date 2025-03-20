export interface VendorAuth {
  id: string;
  vendor_id: string;
  username: string;
  is_active: boolean;
  last_login: string | null;
  password_reset_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface VendorRegistrationData {
  vendor_id: string;
  username: string;
  password: string;
}

export interface VendorAuthResponse {
  vendor_id: string;
  auth_id: string;
  is_valid: boolean;
}
