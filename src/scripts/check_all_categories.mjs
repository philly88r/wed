import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function getAllCategories() {
    try {
        const categories = await pool.query(`
            SELECT id, name, icon, description
            FROM vendor_categories
            ORDER BY name;
        `);
        
        // Print each category with all its details
        console.log('Categories in database:');
        categories.rows.forEach(cat => {
            console.log(`\nCategory: ${cat.name}`);
            console.log(`ID: ${cat.id}`);
            console.log(`Icon: ${cat.icon}`);
            console.log(`Description: ${cat.description}`);
            console.log('-'.repeat(50));
        });

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

getAllCategories();
