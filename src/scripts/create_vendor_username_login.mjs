import pkg from 'pg';
import crypto from 'crypto';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

// Simple SHA-256 hash function - matches the browser implementation
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function createVendorLogin() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Check if vendor_auth table exists, create if not
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'vendor_auth'
            );
        `);
        
        if (!tableCheck.rows[0].exists) {
            console.log('Creating vendor_auth table...');
            await client.query(`
                CREATE TABLE vendor_auth (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                    auth_type TEXT NOT NULL,
                    auth_details JSONB NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `);
        }
        
        // Check if Purslane Catering exists
        const vendorResult = await client.query(`
            SELECT id, name FROM vendors WHERE name = 'PURSLANE CATERING'
        `);
        
        if (vendorResult.rows.length === 0) {
            throw new Error('Vendor not found: PURSLANE CATERING');
        }
        
        const vendorId = vendorResult.rows[0].id;
        const vendorName = vendorResult.rows[0].name;
        
        // Use simple, consistent credentials
        const username = 'purslane';
        const password = 'catering123';
        const passwordHash = hashPassword(password);
        
        console.log('Generated credentials:');
        console.log('- Username:', username);
        console.log('- Password:', password);
        console.log('- Password hash:', passwordHash);
        
        // Delete any existing auth for this vendor
        await client.query(`
            DELETE FROM vendor_auth WHERE vendor_id = $1
        `, [vendorId]);
        
        // Create auth details object
        const authDetails = {
            username: username,
            password_hash: passwordHash,
            is_active: true
        };
        
        // Insert vendor auth with username/password
        await client.query(`
            INSERT INTO vendor_auth (
                vendor_id, 
                auth_type, 
                auth_details
            )
            VALUES (
                $1,
                'username_password',
                $2
            )
        `, [vendorId, JSON.stringify(authDetails)]);
        
        // Verify the data was inserted correctly
        const verifyResult = await client.query(`
            SELECT auth_details FROM vendor_auth WHERE vendor_id = $1
        `, [vendorId]);
        
        if (verifyResult.rows.length > 0) {
            console.log('Stored auth details:', JSON.stringify(verifyResult.rows[0].auth_details, null, 2));
        }
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('\nVendor login created successfully!');
        console.log('----------------------------------------');
        console.log('Vendor:', vendorName);
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('----------------------------------------');
        console.log('Login URL: http://localhost:5174/vendor/login');
        
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error creating vendor login:', error);
    } finally {
        client.release();
        pool.end();
    }
}

createVendorLogin();
