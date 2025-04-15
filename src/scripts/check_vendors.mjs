import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function checkVendors() {
    try {
        // Count vendors by category
        const result = await pool.query(`
            SELECT 
                vc.name as category,
                COUNT(v.*) as vendor_count
            FROM vendor_categories vc
            LEFT JOIN vendors v ON v.category_id = vc.id
            GROUP BY vc.name
            ORDER BY vc.name;
        `);
        
        console.log('Vendor counts by category:');
        result.rows.forEach(row => {
            console.log(`${row.category}: ${row.vendor_count}`);
        });

        // Get total count
        const total = await pool.query('SELECT COUNT(*) FROM vendors;');
        console.log(`\nTotal vendors: ${total.rows[0].count}`);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

checkVendors();
