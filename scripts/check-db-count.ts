import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkCount() {
  const result = await pool.query('SELECT COUNT(*) FROM foods');
  console.log(`Total foods in database: ${result.rows[0].count}`);

  const sampleResult = await pool.query('SELECT name FROM foods LIMIT 10');
  console.log('\nSample foods:');
  sampleResult.rows.forEach(row => console.log(`  - ${row.name}`));

  await pool.end();
}

checkCount();
