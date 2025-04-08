import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function addTableTemplates() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Define new table templates to add
    const tableTemplates = [
      {
        name: 'Round Table (4)',
        shape: 'round',
        width: 100,
        length: 100,
        seats: 4,
        is_predefined: true
      },
      {
        name: 'Round Table (6)',
        shape: 'round',
        width: 120,
        length: 120,
        seats: 6,
        is_predefined: true
      },
      {
        name: 'Round Table (8)',
        shape: 'round',
        width: 140,
        length: 140,
        seats: 8,
        is_predefined: true
      },
      {
        name: 'Round Table (10)',
        shape: 'round',
        width: 160,
        length: 160,
        seats: 10,
        is_predefined: true
      },
      {
        name: 'Rectangular Table (6)',
        shape: 'rectangle',
        width: 100,
        length: 180,
        seats: 6,
        is_predefined: true
      },
      {
        name: 'Rectangular Table (8)',
        shape: 'rectangle',
        width: 120,
        length: 200,
        seats: 8,
        is_predefined: true
      },
      {
        name: 'Rectangular Table (10)',
        shape: 'rectangle',
        width: 120,
        length: 240,
        seats: 10,
        is_predefined: true
      },
      {
        name: 'Square Table (4)',
        shape: 'square',
        width: 100,
        length: 100,
        seats: 4,
        is_predefined: true
      },
      {
        name: 'Oval Table (6)',
        shape: 'oval',
        width: 120,
        length: 180,
        seats: 6,
        is_predefined: true
      },
      {
        name: 'Oval Table (8)',
        shape: 'oval',
        width: 140,
        length: 200,
        seats: 8,
        is_predefined: true
      }
    ];

    // First, check if templates already exist to avoid duplicates
    const existingTemplatesResult = await client.query('SELECT name FROM table_templates');
    const existingTemplateNames = existingTemplatesResult.rows.map(row => row.name);
    
    // Filter out templates that already exist
    const newTemplates = tableTemplates.filter(template => 
      !existingTemplateNames.includes(template.name)
    );

    if (newTemplates.length === 0) {
      console.log('All templates already exist in the database. No new templates to add.');
      return;
    }

    // Insert new templates
    for (const template of newTemplates) {
      await client.query(
        'INSERT INTO table_templates (name, shape, width, length, seats, is_predefined) VALUES ($1, $2, $3, $4, $5, $6)',
        [template.name, template.shape, template.width, template.length, template.seats, template.is_predefined]
      );
      console.log(`Added template: ${template.name}`);
    }

    console.log(`Successfully added ${newTemplates.length} new table templates`);
  } catch (error) {
    console.error('Error adding table templates:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
addTableTemplates();
