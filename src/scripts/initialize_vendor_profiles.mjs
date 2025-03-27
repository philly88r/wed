import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeVendorProfiles() {
    try {
        console.log('Initializing vendor profiles with default values...');
        
        // Update all vendors with empty/default values
        await pool.query(`
            UPDATE vendors 
            SET 
                description = '',
                contact_info = '{"email": "", "phone": "", "website": ""}'::jsonb,
                social_media = '{"instagram": "", "facebook": ""}'::jsonb,
                is_featured = false,
                gallery_images = '[]'::jsonb,
                pricing_details = '{"tier": "unset", "packages": [], "price_range": {"min": 0, "max": 0, "currency": "USD"}}'::jsonb,
                availability = '{"lead_time_days": 0, "peak_season": [], "off_peak_season": []}'::jsonb,
                services_offered = '[]'::jsonb,
                amenities = '{}',
                faq = '[]'::jsonb,
                updated_at = NOW()
        `);

        console.log('Successfully initialized all vendor profiles with default values.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

initializeVendorProfiles();
