import pg from 'pg';

// Using the direct PostgreSQL connection as specified in the memory
const connectionString = 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres';

// Create a PostgreSQL client
const client = new pg.Client({
  connectionString,
});

async function addSimpleTemplates() {
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // First, check what shapes are currently used
    const shapesResult = await client.query('SELECT DISTINCT shape FROM table_templates');
    const existingShapes = shapesResult.rows.map(row => row.shape);
    console.log('Existing shapes:', existingShapes);

    // Check existing templates
    const existingTemplatesResult = await client.query('SELECT name FROM table_templates');
    const existingTemplateNames = existingTemplatesResult.rows.map(row => row.name);
    console.log('Existing template names:', existingTemplateNames);

    // Define new templates based on existing shapes
    // We'll use the first shape we found as a safe value
    const defaultShape = existingShapes.length > 0 ? existingShapes[0] : 'round';
    
    const newTemplates = [
      {
        name: 'Small Table (4)',
        shape: defaultShape,
        width: 100,
        length: 100,
        seats: 4,
        is_predefined: true
      },
      {
        name: 'Medium Table (6)',
        shape: defaultShape,
        width: 120,
        length: 120,
        seats: 6,
        is_predefined: true
      },
      {
        name: 'Large Table (8)',
        shape: defaultShape,
        width: 140,
        length: 140,
        seats: 8,
        is_predefined: true
      },
      {
        name: 'Extra Large Table (10)',
        shape: defaultShape,
        width: 160,
        length: 160,
        seats: 10,
        is_predefined: true
      }
    ];

    // Filter out templates that already exist
    const templatesToAdd = newTemplates.filter(template => 
      !existingTemplateNames.includes(template.name)
    );

    if (templatesToAdd.length === 0) {
      console.log('All templates already exist in the database. No new templates to add.');
      return;
    }

    // Insert new templates
    for (const template of templatesToAdd) {
      await client.query(
        'INSERT INTO table_templates (name, shape, width, length, seats, is_predefined) VALUES ($1, $2, $3, $4, $5, $6)',
        [template.name, template.shape, template.width, template.length, template.seats, template.is_predefined]
      );
      console.log(`Added template: ${template.name}`);
    }

    console.log(`Successfully added ${templatesToAdd.length} new table templates`);
  } catch (error) {
    console.error('Error adding table templates:', error);
  } finally {
    // Close the database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the function
addSimpleTemplates();
