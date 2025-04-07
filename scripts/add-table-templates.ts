import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kdhwrlhzevzekoanusbs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkaHdybGh6ZXZ6ZWtvYW51c2JzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg5MzY5NDcsImV4cCI6MjAxNDUxMjk0N30.LTG9sozXMFHQPYJ9o_V93YN4RZAYiJXqm_yGEUFF7Yk'
);

async function addTableTemplates() {
  const templates = [
    {
      id: 'round-60',
      name: 'Round Table (60")',
      shape: 'circle',
      width: 60,
      length: 60,
      seats: 8,
      is_predefined: true
    },
    {
      id: 'banquet-8x4',
      name: 'Banquet Table (8x4)',
      shape: 'rectangle',
      width: 96,
      length: 48,
      seats: 8,
      is_predefined: true
    },
    {
      id: 'square-4x4',
      name: 'Square Table (4x4)',
      shape: 'square',
      width: 48,
      length: 48,
      seats: 8,
      is_predefined: true
    },
    {
      id: 'oval-72x42',
      name: 'Oval Table (72x42)',
      shape: 'oval',
      width: 72,
      length: 42,
      seats: 8,
      is_predefined: true
    },
    {
      id: 'serpentine',
      name: 'Serpentine Table',
      shape: 'curved',
      width: 144,
      length: 48,
      seats: 12,
      is_predefined: true
    },
    {
      id: 'head-12x4',
      name: 'Head Table (12x4)',
      shape: 'rectangle',
      width: 144,
      length: 48,
      seats: 14,
      is_predefined: true
    }
  ];

  try {
    // First create the table if it doesn't exist
    const { error: createError } = await supabase.rpc('create_table_templates_if_not_exists');
    if (createError) {
      console.error('Error creating table:', createError);
      return;
    }

    // Then upsert the templates
    const { error: upsertError } = await supabase
      .from('table_templates')
      .upsert(templates, { onConflict: 'id' });

    if (upsertError) {
      console.error('Error upserting templates:', upsertError);
      return;
    }

    console.log('Successfully added table templates');
  } catch (error) {
    console.error('Error:', error);
  }
}

addTableTemplates();
