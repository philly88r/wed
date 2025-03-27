import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

// Category IDs from database
const CATEGORY_IDS = {
    'VENUES': '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e',
    'CAKE/DESSERTS': 'bb1f9b43-7c2e-4b3f-a7f1-d92f7c4c3b2e',
    'CATERING/STAFFING': '3e8b2d76-1f5a-4c9d-b8e2-f1d3b7a8c9e0',
    'COUPLE ATTIRE': 'cc2f9c44-8d3e-4c3f-a7f1-d92f7c4c3b3e',
    'DJ\'S': '99df9d51-5f3e-8f3f-a7f1-d92f7c4c3bae',
    'LIVE MUSIC': '051803d5-52fc-4b1d-916d-710c758b9df8',
    'FLORALS/FLORAL PRESERVATION': '5a0d4f98-3a7c-6e1f-da04-a3f5d9c0e1a2',
    'HAIR & MAKEUP': 'dd3f9d45-9e3e-4d3f-a7f1-d92f7c4c3b4e',
    'OFFICIANTS': '4d7f9c44-9c1e-4b3f-a7f1-d92f7c4c3b2f',
    'PHOTOGRAPHERS': '5d8f9d45-9c1e-4b3f-a7f1-d92f7c4c3b3f',
    'RENTALS': 'ee4f9e46-0f3e-4e3f-a7f1-d92f7c4c3b5e',
    'STATIONERY': 'ff5f9f47-1f3e-4f3f-a7f1-d92f7c4c3b6e',
    'STYLING': '66af9a48-2f3e-5f3f-a7f1-d92f7c4c3b7e',
    'TRANSPORTATION': '77bf9b49-3f3e-6f3f-a7f1-d92f7c4c3b8e',
    'VIDEOGRAPHERS': '88cf9c50-4f3e-7f3f-a7f1-d92f7c4c3b9e'
};

// List of vendors - Part 2
const VENDORS = [
    // Rest of CAKE/DESSERTS
    { name: 'WILD FLOUR', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'COTTAGE CAKE WITCH', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'DORTONI BAKERY', category: 'CAKE/DESSERTS', location: 'LONG ISLAND' },
    { name: 'ANNA\'S CAKE DESIGN', category: 'CAKE/DESSERTS', location: 'LONG ISLAND' },
    { name: 'THE VINTAGE CAKE', category: 'CAKE/DESSERTS', location: 'NEW JERSEY' },
    { name: 'CONFECTIONS OF A ROCKSTAR', category: 'CAKE/DESSERTS', location: 'NEW JERSEY' },
    { name: 'PAPA GANACHE', category: 'CAKE/DESSERTS', location: 'NEW JERSEY' },
    { name: 'ANTOINETTE BOULANGERIE', category: 'CAKE/DESSERTS', location: 'NEW JERSEY' },
    { name: 'NATALE\'S BAKERY', category: 'CAKE/DESSERTS', location: 'NEW JERSEY' },

    // Rest of PHOTOGRAPHERS
    { name: 'LAURA HUERTAS PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'LONG ISLAND' },
    { name: 'LAUREN O\'BRIEN PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'LONG ISLAND' },
    { name: 'LORETO CACERES PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'MATT AGAN PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'MEGAN AND KENNETH', category: 'PHOTOGRAPHERS', location: 'HUDSON VALLEY' },
    { name: 'MICHAEL CASSARA PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'LONG ISLAND' },
    { name: 'NICOLE PLETT', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'RACHEL LEINER PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'LONG ISLAND' },
    { name: 'RUBY OLIVIA PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'SARAH LOCKHART PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'SAMM BLAKE', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'SCRATCH STUDIOS', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'STEPHANIE NARU', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'SYLVIE ROSOKOFF', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'VIK MOON', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'WEDDINGS BY NATO', category: 'PHOTOGRAPHERS', location: 'NYC' },

    // All VIDEOGRAPHERS
    { name: 'AFTER IT ALL', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'EDWARD WINTER', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'FORGED IN THE NORTH', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'HITCHES AND UNIONS', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'JORDAN TENENBAUM', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'KAMP WEDDINGS', category: 'VIDEOGRAPHERS', location: 'HUDSON VALLEY' },
    { name: 'LOVEBRAIN FILMS', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'NATURA COLLECTIVE', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'REEL FEELS VIDEO', category: 'VIDEOGRAPHERS', location: 'NYC' },
    { name: 'SHARIFILMS', category: 'VIDEOGRAPHERS', location: 'NYC' },

    // All DJs
    { name: '74 EVENTS', category: 'DJ\'S', location: 'NYC' },
    { name: 'BPM EVENTS', category: 'DJ\'S', location: 'NYC' },
    { name: 'DART COLLECTIVE', category: 'DJ\'S', location: 'NEW JERSEY' },
    { name: 'DJ BEN BOYLAN', category: 'DJ\'S', location: 'NYC' },
    { name: 'DJ EMPANADAMN', category: 'DJ\'S', location: 'NYC' },
    { name: 'JAY MCELFRESH', category: 'DJ\'S', location: 'NYC' },
    { name: 'JUNE EVENTS', category: 'DJ\'S', location: 'NYC' },
    { name: 'MON AMIE EVENTS', category: 'DJ\'S', location: 'NYC' },
    { name: 'NON-TRADITIONAL WEDDING DJS', category: 'DJ\'S', location: 'NYC' },

    // All LIVE MUSIC
    { name: 'ARAGON ARTISTS', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'AROUND TOWN ENTERTAINMENT', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'ARTLEX ENTERTAINMENT', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'ATOMIC FUNK', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'CAFE WHA?', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'DART COLLECTIVE', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'ELEMENT MUSIC', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'GARRETT & TAMARA', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'GO GO GADJET', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'GREAT FAMILY ARTISTS', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'HANK LANE MUSIC', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'HIGH AND MIGHTY BRASS BAND', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'HIP CONTROL BAND', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'HUDSON HORNS', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'MOD SOCIETY', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'ON THE MOVE ENTERTAINMENT', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'SILVER ARROW BAND', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'SOUND SOCIETY BAND', category: 'LIVE MUSIC', location: 'NYC' },
    { name: 'THE LOYALES', category: 'LIVE MUSIC', location: 'NYC' }
];

async function insertVendors() {
    try {
        console.log('Starting vendor insertion (Part 2)...');
        let insertedCount = 0;
        
        for (const vendor of VENDORS) {
            const result = await pool.query(`
                INSERT INTO vendors (
                    name,
                    category_id,
                    location,
                    description,
                    pricing_details
                ) VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5
                )
                ON CONFLICT (slug) DO UPDATE SET
                    name = EXCLUDED.name,
                    category_id = EXCLUDED.category_id,
                    location = EXCLUDED.location,
                    updated_at = NOW()
                RETURNING name, slug, category_id;
            `, [
                vendor.name,
                CATEGORY_IDS[vendor.category],
                vendor.location,
                '', // Empty description for now
                JSON.stringify({ packages: [], tier: 'unset', avg_price: 0 })
            ]);
            
            console.log(`[${++insertedCount}] Inserted/Updated: ${result.rows[0].name} (${result.rows[0].slug})`);
        }

        console.log(`\nPart 2 complete! Inserted/Updated ${insertedCount} vendors.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

insertVendors();
