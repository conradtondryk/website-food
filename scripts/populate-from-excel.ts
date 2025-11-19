import { config } from 'dotenv';
import * as XLSX from 'xlsx';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const filePath = '/Users/conradtondryk/Downloads/MyFoodData-Nutrition-Facts.xlsx';

async function populateFromExcel() {
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to JSON - skip first 3 header rows
  const data = XLSX.utils.sheet_to_json(sheet, { range: 3 });

  console.log(`\nTotal foods in file: ${data.length}`);
  console.log('\nProcessing foods...');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const row of data as any[]) {
    // Skip if missing essential data
    if (!row.name || row.Calories === 'NULL' || row.Calories === undefined) {
      skipCount++;
      continue;
    }

    // Extract nutrients
    const calories = Math.round(Number(row.Calories) || 0);
    const protein = Number(row['Protein (g)']) || 0;
    const totalFat = Number(row['Fat (g)']) || 0;
    const saturatedFat = Number(row['Saturated Fats (g)']) || 0;
    const unsaturatedFat = Math.max(0, totalFat - saturatedFat);
    const carbs = Number(row['Carbohydrate (g)']) || 0;
    const sugars = Number(row['Sugars (g)']) || 0;
    const fibre = Number(row['Fiber (g)']) || 0;

    // Clean up food name
    let name = row.name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    // Skip if all macro nutrients are 0 or NULL
    if (calories === 0 && protein === 0 && totalFat === 0 && carbs === 0) {
      skipCount++;
      continue;
    }

    try {
      await pool.query(`
        INSERT INTO foods (
          name, portion_size, calories, protein,
          unsaturated_fat, saturated_fat, carbs, sugars, fibre,
          source, source_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
          source_url = EXCLUDED.source_url
      `, [
        name,
        '100g',
        calories,
        protein,
        Number(unsaturatedFat.toFixed(2)),
        Number(saturatedFat.toFixed(2)),
        carbs,
        sugars,
        fibre,
        'myfooddata',
        'https://www.myfooddata.com'
      ]);

      successCount++;
      if (successCount % 500 === 0) {
        console.log(`Processed ${successCount} foods...`);
      }
    } catch (error: any) {
      // Log first few errors to see what's wrong
      if (errorCount < 3) {
        console.error(`Error #${errorCount + 1} for "${name}":`, error.message);
      }
      errorCount++;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Successfully added/updated: ${successCount}`);
  console.log(`Skipped (missing data): ${skipCount}`);
  console.log(`Errors: ${errorCount}`);

  await pool.end();
}

populateFromExcel().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
