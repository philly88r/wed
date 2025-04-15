import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkVendorAuth() {
    const client = await pool.connect();
    
    try {
        // Check if vendor_auth table exists
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'vendor_auth'
            );
        `);
        
        const tableExists = tableCheck.rows[0].exists;
        console.log('vendor_auth table exists:', tableExists);
        
        if (tableExists) {
            // Get table structure
            const columns = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'vendor_auth';
            `);
            
            console.log('vendor_auth table structure:');
            columns.rows.forEach(col => {
                console.log(`- ${col.column_name} (${col.data_type})`);
            });
            
            // Get sample data
            const sampleData = await client.query(`
                SELECT * FROM vendor_auth LIMIT 5;
            `);
            
            console.log('\nSample vendor_auth data:');
            console.log(JSON.stringify(sampleData.rows, null, 2));
            
            // Check if any auth exists for Purslane Catering
            const vendorResult = await client.query(`
                SELECT id FROM vendors WHERE name = 'PURSLANE CATERING'
            `);
            
            if (vendorResult.rows.length > 0) {
                const vendorId = vendorResult.rows[0].id;
                
                const authResult = await client.query(`
                    SELECT * FROM vendor_auth WHERE vendor_id = $1
                `, [vendorId]);
                
                console.log('\nPurslane Catering auth data:');
                console.log(JSON.stringify(authResult.rows, null, 2));
            }
        }
    } catch (error) {
        console.error('Error checking vendor_auth:', error);
    } finally {
        client.release();
        pool.end();
    }
}

checkVendorAuth();
