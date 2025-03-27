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

// List of vendors - Part 1
const VENDORS = [
    // All VENUES
    { name: '501 UNION', category: 'VENUES', location: 'NYC' },
    { name: '74 WYTHE', category: 'VENUES', location: 'NYC' },
    { name: 'ASBURY HOTEL', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'AUDREY\'S FARM HOUSE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'BASILICA HUDSON', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'BATTELIO', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'BOTTINO', category: 'VENUES', location: 'NYC' },
    { name: 'BRIDGEPOINT', category: 'VENUES', location: 'NYC' },
    { name: 'BRONX ZOO', category: 'VENUES', location: 'NYC' },
    { name: 'BROOKLYN GRANGE', category: 'VENUES', location: 'NYC' },
    { name: 'BROOKLYN WINERY', category: 'VENUES', location: 'NYC' },
    { name: 'BRUSHLAND EATING HOUSE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'BRYANT PARK GRILL', category: 'VENUES', location: 'NYC' },
    { name: 'CHELSEA SQUARE', category: 'VENUES', location: 'NYC' },
    { name: 'DEAR MOUNTAIN INN', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'DOBBIN ST', category: 'VENUES', location: 'NYC' },
    { name: 'DUMBO LOFT', category: 'VENUES', location: 'NYC' },
    { name: 'FLOATING FARMHOUSE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'FRANKIES 457', category: 'VENUES', location: 'NYC' },
    { name: 'FULL MOON RESORT', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'GELSO AND GRAND', category: 'VENUES', location: 'NYC' },
    { name: 'GREENPOINT LOFT', category: 'VENUES', location: 'NYC' },
    { name: 'HAROLD PRATT HOUSE', category: 'VENUES', location: 'NYC' },
    { name: 'HASBROUCK HOUSE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'HAYFIELS CATSKILLS', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'HOUSING WORKS', category: 'VENUES', location: 'NYC' },
    { name: 'HUDSON HOUSE', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'JANE HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'LIBERTY HOUSE', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'LIBERTY WAREHOUSE', category: 'VENUES', location: 'NYC' },
    { name: 'MEADOW RIDGE AT HUDSON VALLEY', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'NEW YORK BOTANICAL GARDEN', category: 'VENUES', location: 'NYC' },
    { name: 'PROSPECT PARK BOATHOUSE', category: 'VENUES', location: 'NYC' },
    { name: 'RAINBOW ROOM', category: 'VENUES', location: 'NYC' },
    { name: 'ROBERTA\'S', category: 'VENUES', location: 'NYC' },
    { name: 'RULE OF THIRDS', category: 'VENUES', location: 'NYC' },
    { name: 'SOUND RIVER STUDIOS', category: 'VENUES', location: 'NYC' },
    { name: 'SPILLIAN', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'TALEA', category: 'VENUES', location: 'NYC' },
    { name: 'TAVERN ON THE GREEN', category: 'VENUES', location: 'NYC' },
    { name: 'THE ARNOLD HOUSE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'THE BORDONE LIC', category: 'VENUES', location: 'NYC' },
    { name: 'THE BOWERY HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'THE DEBRUCE', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'THE FOUNDRY', category: 'VENUES', location: 'NYC' },
    { name: 'THE FREEHAND HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'THE HOTEL CHELSEA', category: 'VENUES', location: 'NYC' },
    { name: 'THE LOBSTER CLUB', category: 'VENUES', location: 'NYC' },
    { name: 'THE PARK CHATEAU', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'THE ROCKAWAY HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'THE VIEW AT BATTERY PARK', category: 'VENUES', location: 'NYC' },
    { name: 'THE WYTHE HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'TRIBECA ROOFTOP', category: 'VENUES', location: 'NYC' },
    { name: 'TROUTBECK', category: 'VENUES', location: 'HUDSON VALLEY' },
    { name: 'TWA HOTEL', category: 'VENUES', location: 'NYC' },
    { name: 'WAVE HILL', category: 'VENUES', location: 'NYC' },
    { name: 'WAVE RESORT', category: 'VENUES', location: 'NEW JERSEY' },
    { name: 'WEYLIN', category: 'VENUES', location: 'NYC' },
    { name: 'WILDFLOWER FARMS', category: 'VENUES', location: 'HUDSON VALLEY' },

    // Half of CAKE/DESSERTS
    { name: 'CAKE HERO', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'NINE CAKES', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'LAEL CAKES', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'LULU CAKE BOUTIQUE', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'LUCKYBIRD BAKERY', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'FROM LUCIE', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'MIA\'S BAKERY', category: 'CAKE/DESSERTS', location: 'NYC' },
    { name: 'HUDSON CAKERY', category: 'CAKE/DESSERTS', location: 'HUDSON VALLEY' },
    { name: 'AGNES DEVEREUX', category: 'CAKE/DESSERTS', location: 'HUDSON VALLEY' },
    { name: 'THE HUDSON CAKE STUDIO', category: 'CAKE/DESSERTS', location: 'HUDSON VALLEY' },

    // Half of PHOTOGRAPHERS
    { name: '98 WEDDING CO.', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'ASHLEY SAWTELLE', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'CALEN ROSE', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'CHAZ CRUZ PHOTOGRAPHERS', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'CHELLISE MICHAEL PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'CHEYANNA DE NICOLA PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'HUDSON VALLEY' },
    { name: 'EDWARD WINTER', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'EILEEN MENY PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'ERICA READE PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'FORGED IN THE NORTH', category: 'PHOTOGRAPHERS', location: 'LONG ISLAND' },
    { name: 'FORGED IN THE NORTH (LI)', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'GIANNA LEO FALCON', category: 'PHOTOGRAPHERS', location: 'HUDSON VALLEY' },
    { name: 'IMPRESSENSHI', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'JUSTIN MCCALLUM PHOTOGRAPHY', category: 'PHOTOGRAPHERS', location: 'NYC' },
    { name: 'KELLY GIARROCCO', category: 'PHOTOGRAPHERS', location: 'NYC' }
];

async function insertVendors() {
    try {
        console.log('Starting vendor insertion (Part 1)...');
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

        console.log(`\nPart 1 complete! Inserted/Updated ${insertedCount} vendors.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

insertVendors();
