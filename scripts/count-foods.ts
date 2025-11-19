import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function countFoods() {
  const result = await pool.query('SELECT COUNT(*) FROM foods');
  console.log(`Total foods in database: ${result.rows[0].count}`);

  const sourceResult = await pool.query(`
    SELECT source, COUNT(*) as count
    FROM foods
    GROUP BY source
  `);
  console.log('\nFoods by source:');
  sourceResult.rows.forEach(row => {
    console.log(`  ${row.source}: ${row.count}`);
  });

  await pool.end();
}

countFoods().catch(console.error);
