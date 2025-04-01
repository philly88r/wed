import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the correct credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// PostgreSQL connection string for direct database access
// postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres
export const pgConnectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';
