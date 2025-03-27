import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the React app's dist directory (built files)
app.use(express.static(join(__dirname, 'dist')));

// Get all vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const { data: vendors, error } = await supabase
      .from('vendors')
      .select(`
        *,
        category:vendor_categories (
          id,
          name,
          slug,
          icon,
          description
        )
      `)
      .order('name');

    if (error) throw error;
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to fetch vendors', error: error.message });
  }
});

// Get vendor by ID
app.get('/api/vendors/:id', async (req, res) => {
  try {
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        category:vendor_categories (
          id,
          name,
          slug,
          icon,
          description
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      throw error;
    }

    res.json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Failed to fetch vendor', error: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
});

// API routes should be defined before the catchall

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
