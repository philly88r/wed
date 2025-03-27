import pkg from 'pg';
import crypto from 'crypto';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

// Simple SHA-256 hash function to match the one in the app
async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        try {
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            resolve(hash);
        } catch (err) {
            reject(err);
        }
    });
}

async function fixVendorAccess() {
    const client = await pool.connect();
    
    try {
        // Start transaction
        await client.query('BEGIN');
        
        // Check if Purslane Catering exists
        const vendorResult = await client.query(`
            SELECT id FROM vendors WHERE name = 'PURSLANE CATERING'
        `);
        
        if (vendorResult.rows.length === 0) {
            throw new Error('Vendor not found: PURSLANE CATERING');
        }
        
        const vendorId = vendorResult.rows[0].id;
        const accessToken = 'PURSLANE123';
        const password = 'password123';
        
        // Hash the password using Node.js crypto (same algorithm as in browser)
        const passwordHash = await hashPassword(password);
        console.log('Generated password hash:', passwordHash);
        
        // Delete any existing access tokens for this vendor
        await client.query(`
            DELETE FROM vendor_access WHERE vendor_id = $1
        `, [vendorId]);
        
        // Insert test vendor access with correctly hashed password
        await client.query(`
            INSERT INTO vendor_access (vendor_id, access_token, password_hash, expires_at)
            VALUES (
                $1,           -- Vendor ID
                $2,           -- Access token
                $3,           -- Password hash
                NOW() + INTERVAL '7 days'
            )
        `, [vendorId, accessToken, passwordHash]);
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log('Vendor access fixed successfully!');
        console.log('----------------------------------------');
        console.log('Vendor: PURSLANE CATERING');
        console.log('Access Link: http://localhost:5174/vendor/login/PURSLANE123');
        console.log('Password: password123');
        console.log('Expires: 7 days from now');
        console.log('----------------------------------------');
        
    } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error('Error fixing vendor access:', error);
    } finally {
        client.release();
        pool.end();
    }
}

fixVendorAccess();
