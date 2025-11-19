import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function clearAllFoods() {
  try {
    // Count foods before deletion
    const countResult = await pool.query('SELECT COUNT(*) FROM foods');
    console.log(`Found ${countResult.rows[0].count} total foods in database`);

    // Delete all foods
    const deleteResult = await pool.query('DELETE FROM foods');
    console.log(`Deleted ${deleteResult.rowCount} foods`);

    // Verify empty
    const remainingResult = await pool.query('SELECT COUNT(*) FROM foods');
    console.log(`\nRemaining foods: ${remainingResult.rows[0].count}`);

    await pool.end();
  } catch (error) {
    console.error('Error clearing foods:', error);
    await pool.end();
    process.exit(1);
  }
}

clearAllFoods();
