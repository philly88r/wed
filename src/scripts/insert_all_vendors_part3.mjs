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

// List of vendors - Part 3
const VENDORS = [
    // All CATERING/STAFFING
    { name: 'COMPARTI CATERING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'BARTLEBY AND SAGE', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'PRESERVING HARVEST CATERING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'CREATIVE FOODS CATERING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'CLOUD CATERING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'PURSLANE', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'DEBORAH MILLER CATERING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'MARLOW EVENTS', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'ROAMING HUNGER', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'NY FOOD TRUCK ASSOCIATION', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'ULTRA EVENTS & STAFFING', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'DISH', category: 'CATERING/STAFFING', location: 'NYC' },
    { name: 'CORINNE\'S CONCEPTS IN CATERING', category: 'CATERING/STAFFING', location: 'LONG ISLAND' },
    { name: 'LAND\'S END WEDDINGS', category: 'CATERING/STAFFING', location: 'LONG ISLAND' },
    { name: 'OAK & HONEY CATERING', category: 'CATERING/STAFFING', location: 'NEW JERSEY' },
    { name: 'IN THYME', category: 'CATERING/STAFFING', location: 'NEW JERSEY' },
    { name: 'TWIN OAK CATERERS', category: 'CATERING/STAFFING', location: 'NEW JERSEY' },

    // All STATIONERY
    { name: 'ADARA BY BADAL', category: 'STATIONERY', location: 'NYC' },
    { name: 'GOODS GANG', category: 'STATIONERY', location: 'NYC' },
    { name: 'I CAN DO THAT DESIGN', category: 'STATIONERY', location: 'NYC' },
    { name: 'MAX AND MAIDEN INK', category: 'STATIONERY', location: 'NEW JERSEY' },
    { name: 'MINTED', category: 'STATIONERY', location: 'NYC' },
    { name: 'PAPER HEART COMPANY', category: 'STATIONERY', location: 'HUDSON VALLEY' },
    { name: 'POLK PAPER', category: 'STATIONERY', location: 'NYC' },
    { name: 'RACHEL ZUCH', category: 'STATIONERY', location: 'NYC' },

    // All COUPLE ATTIRE
    { name: 'BHLDN', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'GABRIELLE', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'SPINA BRIDE', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'SUITSUPPLY', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'BROOKLYN TAILORS', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'THE BLACK TUX', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'LOULETTE BRIDE', category: 'COUPLE ATTIRE', location: 'NYC' },
    { name: 'IVORY & VEIL BRIDAL', category: 'COUPLE ATTIRE', location: 'NEW JERSEY' },
    { name: 'ABIGAIL BRIDE', category: 'COUPLE ATTIRE', location: 'NEW JERSEY' },
    { name: 'IRA\'S BRIDAL STUDIO', category: 'COUPLE ATTIRE', location: 'NEW JERSEY' },
    { name: 'LOVELY BRIDE', category: 'COUPLE ATTIRE', location: 'NYC' },

    // All HAIR & MAKEUP
    { name: 'BEAUTINI', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'BEAUTY ICON', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'BEYOND THE BRUSH', category: 'HAIR & MAKEUP', location: 'LONG ISLAND' },
    { name: 'BRIDAL CHIC', category: 'HAIR & MAKEUP', location: 'LONG ISLAND' },
    { name: 'BRUSH AND BLUSH', category: 'HAIR & MAKEUP', location: 'LONG ISLAND' },
    { name: 'CURLED & CONTOURED', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'ELLE WESTBY OF GEMHOUSE', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'FELICIA GRAHAM BEAUTY', category: 'HAIR & MAKEUP', location: 'NEW JERSEY' },
    { name: 'JFINK BEAUTY', category: 'HAIR & MAKEUP', location: 'LONG ISLAND' },
    { name: 'MAKEUP BY LUCAS', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'MARISSA MOLNAR HAIR', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'OLIVIA GARVIN MAKEUP', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'PRE-DAME BEAUTY', category: 'HAIR & MAKEUP', location: 'NYC' },
    { name: 'WILLOW HOUSE BEAUTY', category: 'HAIR & MAKEUP', location: 'NYC' },

    // All TRANSPORTATION
    { name: 'BUSTER', category: 'TRANSPORTATION', location: 'NYC' },
    { name: 'KING & QUEEN LIMO', category: 'TRANSPORTATION', location: 'NYC' },
    { name: 'THE NEW YORK TROLLEY COMPANY', category: 'TRANSPORTATION', location: 'NYC' },
    { name: 'FILM CARS', category: 'TRANSPORTATION', location: 'NYC' },
    { name: 'CHARTER EVERYTHING', category: 'TRANSPORTATION', location: 'NEW JERSEY' },
    { name: 'LUXOR LIMO', category: 'TRANSPORTATION', location: 'NYC' },
    { name: 'TOPTOWN LIMO RIDE', category: 'TRANSPORTATION', location: 'NEW JERSEY' },
    { name: 'PARTY BUS LIMOS & MORE', category: 'TRANSPORTATION', location: 'NEW JERSEY' },
    { name: 'BBZ LIMO SERVICE', category: 'TRANSPORTATION', location: 'NEW JERSEY' },

    // All RENTALS
    { name: 'BROADWAY PARTY RENTALS', category: 'RENTALS', location: 'NYC' },
    { name: 'PARTY RENTAL LTD', category: 'RENTALS', location: 'NYC' },
    { name: 'PATINA RENTALS', category: 'RENTALS', location: 'NYC' },
    { name: 'ATLAS PARTY RENTALS', category: 'RENTALS', location: 'NYC' },
    { name: 'ACE PARTY & TENT RENTALS', category: 'RENTALS', location: 'NYC' },
    { name: 'BIG DAWG PARTY RENTALS', category: 'RENTALS', location: 'NYC' },
    { name: 'GLAM RENTALS', category: 'RENTALS', location: 'NEW JERSEY' },
    { name: 'CEDAR + SAGE RENTALS', category: 'RENTALS', location: 'NEW JERSEY' },

    // All FLORALS/FLORAL PRESERVATION
    { name: 'AHNA HAN', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'AP BIO', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'AURORA BOTANICA', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'BLOOM BLOOM STUDIO', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'BRAVE FLORAL', category: 'FLORALS/FLORAL PRESERVATION', location: 'NEW JERSEY' },
    { name: 'DAYS OF MAY FLOWERS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'EXTRAFLORAL STUDIO', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'FERN BOTANICA', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'FRAMED FLORALS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'GARDEN IN THE PINES', category: 'FLORALS/FLORAL PRESERVATION', location: 'NEW JERSEY' },
    { name: 'AMBER AND EARTH', category: 'FLORALS/FLORAL PRESERVATION', location: 'NEW JERSEY' },
    { name: 'RISING TIDE BOTANICALS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NEW JERSEY' },
    { name: 'JOI BLOOMS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'LITTLE SISTER CREATIVE', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'MOLLY OLIVER FLOWERS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'OLIVIA HOWARD DESIGNS', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'ROSEHIP SOCIAL', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'ROSEWOOD FLORAL CO', category: 'FLORALS/FLORAL PRESERVATION', location: 'NYC' },
    { name: 'STREGA FLORAL', category: 'FLORALS/FLORAL PRESERVATION', location: 'HUDSON VALLEY' },
    { name: 'THREE NOTCHES FLORAL', category: 'FLORALS/FLORAL PRESERVATION', location: 'HUDSON VALLEY' },

    // All OFFICIANTS
    { name: 'HONEYBREAK OFFICIANTS', category: 'OFFICIANTS', location: 'NYC' },
    { name: 'COMMONGROUND CEREMONIES', category: 'OFFICIANTS', location: 'NYC' },
    { name: 'ONCE UPON A VOW', category: 'OFFICIANTS', location: 'NYC' },
    { name: 'REV ANNIE', category: 'OFFICIANTS', location: 'NYC' },

    // STYLING
    { name: 'AGENCY 8 BRIDAL STYLIST', category: 'STYLING', location: 'NYC' }
];

async function insertVendors() {
    try {
        console.log('Starting vendor insertion (Part 3)...');
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

        console.log(`\nPart 3 complete! Inserted/Updated ${insertedCount} vendors.`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

insertVendors();
