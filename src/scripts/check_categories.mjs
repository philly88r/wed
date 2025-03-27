import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkCategories() {
    try {
        // Check specifically for VENUES category
        const venuesCategory = await pool.query(`
            SELECT id, name, icon, description
            FROM vendor_categories
            WHERE name = 'VENUES';
        `);
        console.log('VENUES category:', venuesCategory.rows[0]);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkCategories();
