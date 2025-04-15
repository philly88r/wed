import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Yitbos88@db.yemkduykvfdjmldxfphq.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function testInsert() {
    try {
        // Try to insert a test vendor using the correct VENUES category ID
        const result = await pool.query(`
            INSERT INTO vendors (
                name,
                category_id,
                location,
                description,
                pricing_details
            ) VALUES (
                'TEST VENUE',
                '2d5f9a42-9c1e-4b3f-a7f1-d92f7c4c3b1e', -- Correct VENUES category ID
                'TEST LOCATION',
                'Test Description',
                '{"packages": [], "tier": "unset", "avg_price": 0}'
            ) RETURNING *;
        `);
        
        console.log('Inserted vendor:', result.rows[0]);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}

testInsert();
