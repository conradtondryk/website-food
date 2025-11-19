import { config } from 'dotenv';
import { Pool } from 'pg';
import * as fs from 'fs';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function restoreMyFoodData() {
  try {
    console.log('Loading MyFoodData backup...');

    const backupPath = '/Users/conradtondryk/Downloads/myfooddata-backup.json';
    const foods = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    console.log(`Found ${foods.length} foods to restore`);
    console.log('Restoring to database...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const food of foods) {
      try {
        await pool.query(
          `INSERT INTO foods (
            name, portion_size, calories, protein,
            unsaturated_fat, saturated_fat, carbs, sugars, fibre,
            source, source_url, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (name) DO UPDATE SET
            portion_size = EXCLUDED.portion_size,
            calories = EXCLUDED.calories,
            protein = EXCLUDED.protein,
            unsaturated_fat = EXCLUDED.unsaturated_fat,
            saturated_fat = EXCLUDED.saturated_fat,
            carbs = EXCLUDED.carbs,
            sugars = EXCLUDED.sugars,
            fibre = EXCLUDED.fibre,
            source = EXCLUDED.source,
            source_url = EXCLUDED.source_url`,
          [
            food.name,
            food.portion_size,
            food.calories,
            food.protein,
            food.unsaturated_fat,
            food.saturated_fat,
            food.carbs,
            food.sugars,
            food.fibre,
            food.source,
            food.source_url,
            food.created_at
          ]
        );
        successCount++;
        if (successCount % 1000 === 0) {
          console.log(`Restored ${successCount} foods...`);
        }
      } catch (error) {
        console.error(`Error restoring ${food.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n=== Complete ===`);
    console.log(`Successfully restored: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    // Verify count
    const result = await pool.query('SELECT COUNT(*) FROM foods');
    console.log(`\nTotal foods in database: ${result.rows[0].count}`);

    await pool.end();
  } catch (error) {
    console.error('Error restoring backup:', error);
    await pool.end();
    process.exit(1);
  }
}

restoreMyFoodData();
