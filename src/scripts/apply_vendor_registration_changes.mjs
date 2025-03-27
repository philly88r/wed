import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function applyDatabaseChanges() {
    try {
        console.log('Applying vendor registration database changes...');
        
        // Add reset code fields to vendors table
        await pool.query(`
            ALTER TABLE vendors ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10);
            ALTER TABLE vendors ADD COLUMN IF NOT EXISTS reset_code_expires_at TIMESTAMPTZ;
            ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_pending_approval BOOLEAN DEFAULT FALSE;
        `);
        console.log('✅ Added reset code and approval columns to vendors table');
        
        // Create function to set vendor password
        await pool.query(`
            CREATE OR REPLACE FUNCTION set_vendor_password(vendor_username TEXT, vendor_password TEXT) RETURNS VOID AS $$
            BEGIN
              UPDATE vendors 
              SET password_hash = hash_password(vendor_password)
              WHERE username = vendor_username;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `);
        console.log('✅ Created set_vendor_password function');
        
        console.log('\nAll vendor registration database changes applied successfully!');
    } catch (err) {
        console.error('Error applying database changes:', err.message);
    } finally {
        await pool.end();
    }
}

applyDatabaseChanges();
