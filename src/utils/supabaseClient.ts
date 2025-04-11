import { getSupabase } from '../supabaseClient';

// Use the getSupabase function from the main supabaseClient.ts file
// This ensures we're using a consistent Supabase client instance throughout the application
export const supabase = getSupabase();

// PostgreSQL connection string for direct database access
// postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres
export const pgConnectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';
