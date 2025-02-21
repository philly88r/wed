import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export interface Comment {
  id: string;
  created_at: string;
  section: string;
  content: string;
  commenter_name: string;
  parent_id: string | null;
  resolved: boolean;
  resolved_at: string | null;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    autoRefreshToken: true,
    storage: localStorage,
    storageKey: 'supabase-auth'
  }
});

// Types for our database tables
export type Profile = {
  id: string;
  created_at: string;
  updated_at: string;
  role: 'admin' | 'user';
  email: string;
  full_name: string | null;
  partner_name: string | null;
  wedding_date: string | null;
  wedding_location: string | null;
  guest_count: number | null;
  budget: number | null;
  onboarding_completed: boolean;
};
