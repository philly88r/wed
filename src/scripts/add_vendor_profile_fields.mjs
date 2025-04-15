import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function addVendorProfileFields() {
    try {
        console.log('Adding vendor profile fields...');
        
        // Add new columns
        await pool.query(`
            ALTER TABLE vendors
            ADD COLUMN IF NOT EXISTS description text,
            ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{"email": "", "phone": "", "website": ""}'::jsonb,
            ADD COLUMN IF NOT EXISTS social_media jsonb DEFAULT '{"instagram": "", "facebook": ""}'::jsonb,
            ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
            ADD COLUMN IF NOT EXISTS gallery_images jsonb DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS pricing_details jsonb DEFAULT '{
                "tier": "unset",
                "packages": [],
                "price_range": {"min": 0, "max": 0, "currency": "USD"},
                "deposit_required": {"percentage": 0, "amount": 0, "currency": "USD"},
                "payment_methods": [],
                "cancellation_policy": ""
            }'::jsonb,
            ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{
                "lead_time_days": 0,
                "peak_season": [],
                "off_peak_season": [],
                "travel_zones": []
            }'::jsonb,
            ADD COLUMN IF NOT EXISTS services_offered jsonb DEFAULT '[]'::jsonb,
            ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]'::jsonb;
        `);

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_vendors_is_featured ON vendors (is_featured);
            CREATE INDEX IF NOT EXISTS idx_vendors_pricing_details_tier ON vendors ((pricing_details->>'tier'));
        `);

        console.log('Successfully added vendor profile fields and created indexes.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

addVendorProfileFields();
