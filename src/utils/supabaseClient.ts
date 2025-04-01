import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the correct credentials
const supabaseUrl = 'https://yemkduykvfdjmldxfphq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbWtkdXlrdmZkam1sZHhmcGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA1NjY0MDAsImV4cCI6MTk5NjE0MjQwMH0.S3-NxrP3OqcXJhKYOv6XPBu1NlOvJmQnSEw6BPrLsXQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// PostgreSQL connection string for direct database access
// postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres
export const pgConnectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';
