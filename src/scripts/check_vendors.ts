import db from '../lib/db';

async function checkVendorsTable() {
    try {
        // Check table structure
        const tableInfo = await db.query(`
            SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'vendors'
            ORDER BY ordinal_position;
        `);
        
        console.log('Table Structure:', tableInfo);

        // Check existing records
        const vendors = await db.query('SELECT * FROM vendors LIMIT 5;');
        console.log('\nSample Vendors:', vendors);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.$pool.end();
    }
}

checkVendorsTable();
