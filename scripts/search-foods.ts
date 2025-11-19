import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function searchFoods(searchTerm: string) {
  const result = await pool.query(
    `SELECT name, calories, protein, carbs FROM foods WHERE name LIKE $1 LIMIT 20`,
    [`%${searchTerm}%`]
  );

  console.log(`\nFound ${result.rows.length} foods matching "${searchTerm}":\n`);
  result.rows.forEach(row => {
    console.log(`${row.name} - ${row.calories} cal, ${row.protein}g protein, ${row.carbs}g carbs`);
  });

  await pool.end();
}

const searchTerm = process.argv[2] || 'salmon';
searchFoods(searchTerm).catch(console.error);
