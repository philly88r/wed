import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkVendorsStructure() {
    try {
        // Get detailed table structure
        const result = await pool.query(`
            SELECT 
                column_name,
                data_type,
                column_default,
                is_nullable,
                character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'vendors'
            ORDER BY ordinal_position;
        `);
        
        console.log('Vendors Table Structure:');
        console.log(JSON.stringify(result.rows, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkVendorsStructure();
