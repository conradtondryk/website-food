import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabase() {
  const result = await pool.query(`
    SELECT name, calories, protein, carbs, saturated_fat, unsaturated_fat, sugars, fibre, portion_size
    FROM foods
    LIMIT 10
  `);

  console.log('Sample foods in database:\n');
  result.rows.forEach(row => {
    console.log(`${row.name}:`);
    console.log(`  Calories: ${row.calories}, Protein: ${row.protein}g, Carbs: ${row.carbs}g`);
    console.log(`  Sat Fat: ${row.saturated_fat}g, Unsat Fat: ${row.unsaturated_fat}g`);
    console.log(`  Sugars: ${row.sugars}g, Fibre: ${row.fibre}g`);
    console.log(`  Portion: ${row.portion_size}\n`);
  });

  const count = await pool.query('SELECT COUNT(*) FROM foods');
  console.log(`Total foods in database: ${count.rows[0].count}`);

  await pool.end();
}

checkDatabase().catch(console.error);
