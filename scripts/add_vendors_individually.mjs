import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Define all vendors to add
const vendors = [
  // Photographers
  {
    name: 'KHAKI BEDFORD PHOTOGRAPHY',
    category_id: '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Professional wedding photography services by Khaki Bedford.',
    social_media: { instagram: 'khakibedfordphoto', facebook: '', website: '' }
  },
  {
    name: 'WALLS TRIMBLE',
    category_id: '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Wedding photography services by Walls Trimble.',
    social_media: { instagram: 'trimblenator', facebook: '', website: '' }
  },
  {
    name: 'LOVE FRAMED',
    category_id: '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Capturing your special moments with Love Framed photography.',
    social_media: { instagram: 'loveframed_ig', facebook: '', website: '' }
  },
  {
    name: 'CLAUDIA VAYALA',
    category_id: '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Wedding photography by Claudia Vayala.',
    social_media: { instagram: 'claudiavayala', facebook: '', website: '' }
  },
  
  // Rentals
  {
    name: 'BBJ LA TAVOLA',
    category_id: 'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Premium linen rentals for weddings and special events.',
    social_media: { instagram: 'bbjlatavola', facebook: '', website: '' }
  },
  {
    name: 'SOMETHING DIFFERENT PARTY RENTALS',
    category_id: 'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e',
    location: 'NYC/NJ',
    description: 'Unique and high-quality party rental items for weddings and events.',
    social_media: { instagram: 'sdpr_rentals', facebook: '', website: '' }
  },
  
  // Florals
  {
    name: 'EAST ROSE STUDIO',
    category_id: '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Beautiful floral designs for weddings and special events.',
    social_media: { instagram: 'eastrosestudio', facebook: '', website: '' }
  },
  
  // Styling
  {
    name: 'ALLISON KOEHLER',
    category_id: '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e',
    location: 'NYC, NJ, Hudson Valley and LI',
    description: 'Professional styling services for weddings and events.',
    social_media: { instagram: 'allisonokoehler', facebook: '', website: '' }
  },
  
  // Venues
  {
    name: 'TRIBECA ROOFTOP',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NYC',
    description: 'Stunning rooftop venue in the heart of Tribeca.',
    social_media: { instagram: 'tribecarooftopand360', facebook: '', website: '' }
  },
  {
    name: 'STONEHILLS',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'Hudson Valley',
    description: 'Charming farmhouse venue in the Hudson Valley.',
    social_media: { instagram: 'stonehillsfarmhouse', facebook: '', website: '' }
  },
  {
    name: 'BALTHAZAR',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NYC',
    description: 'Iconic NYC restaurant venue for weddings and events.',
    social_media: { instagram: 'balthazarny', facebook: '', website: '' }
  },
  {
    name: 'MONKEY BAR',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NYC',
    description: 'Historic and elegant venue in midtown Manhattan.',
    social_media: { instagram: 'monkeybar_ny', facebook: '', website: '' }
  },
  {
    name: 'SHELL\'S LOFT',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NYC',
    description: 'Unique loft venue for intimate weddings and events.',
    social_media: { instagram: 'shellsloft', facebook: '', website: '' }
  },
  {
    name: 'THE POOL AND GRILL',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NYC',
    description: 'Sophisticated venue in the former Four Seasons space.',
    social_media: { instagram: 'thepoolnyc', facebook: '', website: '' }
  },
  {
    name: 'PARK CHATEAU AND ESTATES',
    category_id: '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    location: 'NJ',
    description: 'Luxurious chateau venue for weddings and special events.',
    social_media: { instagram: 'parkchaateau', facebook: '', website: '' }
  }
];

async function addVendors() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Check for existing vendors to avoid duplicates
    const { rows: existingVendors } = await client.query('SELECT name FROM vendors');
    const existingNames = existingVendors.map(v => v.name);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const vendor of vendors) {
      // Skip if vendor already exists
      if (existingNames.includes(vendor.name)) {
        console.log(`Skipping ${vendor.name} - already exists`);
        skippedCount++;
        continue;
      }
      
      try {
        // Get category name for better logging
        const { rows: categoryRows } = await client.query(
          'SELECT name FROM vendor_categories WHERE id = $1',
          [vendor.category_id]
        );
        const categoryName = categoryRows.length > 0 ? categoryRows[0].name : 'Unknown';
        
        // Insert the vendor
        await client.query(`
          INSERT INTO vendors (
            id, name, category_id, location, description, 
            pricing_tier, social_media, contact_info, is_featured, is_hidden,
            created_at, updated_at, gallery_limit, video_link
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4,
            $5::jsonb, $6::jsonb, $7::jsonb, false, false,
            NOW(), NOW(), 10, null
          )
        `, [
          vendor.name,
          vendor.category_id,
          vendor.location,
          vendor.description,
          JSON.stringify({ tier: 'premium', avg_price: null }),
          JSON.stringify(vendor.social_media),
          JSON.stringify({ email: '', phone: '', website: '' })
        ]);
        
        console.log(`✅ Added ${vendor.name} (${categoryName})`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error adding ${vendor.name}: ${error.message}`);
      }
    }
    
    console.log(`\nSummary: Added ${addedCount} vendors, skipped ${skippedCount} existing vendors`);
    
    // Generate credentials for new vendors
    console.log('\nGenerating credentials for new vendors...');
    await client.query(`
      DO $$
      DECLARE
        vendor_record RECORD;
        username_val TEXT;
        password_hash_val TEXT;
      BEGIN
        FOR vendor_record IN 
          SELECT id, name FROM vendors 
          WHERE username IS NULL OR username = ''
        LOOP
          -- Generate username from name
          username_val := lower(regexp_replace(vendor_record.name, '[^a-zA-Z0-9]', '', 'g'));
          
          -- Generate password hash
          password_hash_val := crypt(concat(username_val, '-', md5(random()::text)), gen_salt('bf', 6));
          
          -- Update the vendor record
          UPDATE vendors 
          SET 
            username = username_val,
            password_hash = password_hash_val
          WHERE id = vendor_record.id;
          
        END LOOP;
      END $$;
    `);
    
    console.log('✅ Vendor credentials generated');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

addVendors();
