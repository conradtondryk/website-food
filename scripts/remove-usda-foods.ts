import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function removeUsdaFoods() {
  try {
    // First, count how many foods will be removed
    const countResult = await pool.query('SELECT COUNT(*) FROM foods WHERE source = $1', ['usda']);
    console.log(`Found ${countResult.rows[0].count} foods from USDA source`);

    // Delete them
    const deleteResult = await pool.query('DELETE FROM foods WHERE source = $1', ['usda']);
    console.log(`Deleted ${deleteResult.rowCount} foods from USDA source`);

    // Show remaining count
    const remainingResult = await pool.query('SELECT COUNT(*) FROM foods');
    console.log(`\nRemaining foods in database: ${remainingResult.rows[0].count}`);

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
  } catch (error) {
    console.error('Error removing USDA foods:', error);
    await pool.end();
    process.exit(1);
  }
}

removeUsdaFoods();
