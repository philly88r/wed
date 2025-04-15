import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function createVendorAccess() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Create vendor_access table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS vendor_access (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                access_token VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `);
        
        // Enable RLS
        await client.query(`
            ALTER TABLE vendor_access ENABLE ROW LEVEL SECURITY
        `);
        
        // Create policy for public access (needed for login)
        await client.query(`
            DROP POLICY IF EXISTS "Allow public to verify vendor access" ON vendor_access;
            CREATE POLICY "Allow public to verify vendor access"
                ON vendor_access
                FOR SELECT
                USING (true)
        `);
        
        // Check if Purslane Catering exists
        const vendorResult = await client.query(`
            SELECT id FROM vendors WHERE name = 'PURSLANE CATERING'
        `);
        
        if (vendorResult.rows.length === 0) {
            throw new Error('Vendor not found: PURSLANE CATERING');
        }
        
        const vendorId = vendorResult.rows[0].id;
        
        // Delete any existing access tokens for this vendor
        await client.query(`
            DELETE FROM vendor_access WHERE vendor_id = $1
        `, [vendorId]);
        
        // Insert test vendor access
        await client.query(`
            INSERT INTO vendor_access (vendor_id, access_token, password_hash, expires_at)
            VALUES (
                $1,                                                              -- Vendor ID
                'PURSLANE123',                                                   -- Access token
                '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',  -- Hash for 'password123'
                NOW() + INTERVAL '7 days'
            )
        `, [vendorId]);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('Vendor access created successfully!');
        console.log('----------------------------------------');
        console.log('Vendor: PURSLANE CATERING');
        console.log('Access Link: http://localhost:3000/vendor/login/PURSLANE123');
        console.log('Password: password123');
        console.log('Expires: 7 days from now');
        console.log('----------------------------------------');
        
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error creating vendor access:', error);
    } finally {
        client.release();
        pool.end();
    }
}

createVendorAccess();
