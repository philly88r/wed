const pgp = require('pg-promise')();

const config = {
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
};

const db = pgp(config);

async function checkVendorsTable() {
    try {
        // Check table structure
        const tableInfo = await db.query(`
            SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'vendors'
            ORDER BY ordinal_position;
        `);
        
        console.log('Table Structure:', JSON.stringify(tableInfo, null, 2));

        // Check existing records
        const vendors = await db.query('SELECT * FROM vendors LIMIT 5;');
        console.log('\nSample Vendors:', JSON.stringify(vendors, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pgp.end();
    }
}

checkVendorsTable();
