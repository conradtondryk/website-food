import { config } from 'dotenv';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import { Pool } from 'pg';

config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const DATA_DIR = '/tmp/FoodData_Central_foundation_food_csv_2024-10-31';

// Common food keywords to filter by
const COMMON_FOODS = [
  'chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'egg',
  'rice', 'pasta', 'bread', 'potato', 'oat',
  'milk', 'cheese', 'yogurt', 'butter',
  'apple', 'banana', 'orange', 'strawberr', 'blueberr', 'grape',
  'broccoli', 'spinach', 'carrot', 'tomato', 'lettuce', 'onion',
  'almond', 'peanut', 'walnut', 'cashew'
];

const NUTRIENT_IDS = {
  CALORIES: 1008,
  PROTEIN: 1003,
  TOTAL_FAT: 1004,
  SATURATED_FAT: 1258,
  CARBS: 1005,
  SUGARS: 2000,
  FIBER: 1079,
};

interface Food {
  fdc_id: string;
  description: string;
  data_type: string;
}

interface Nutrient {
  fdc_id: string;
  nutrient_id: string;
  amount: string;
}

async function parseCSV<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];
    createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function populateFoundationFiltered() {
  console.log('Loading Foundation Foods...');

  const allFoods = await parseCSV<Food>(`${DATA_DIR}/food.csv`);

  // Load ALL foundation foods
  const foods = allFoods.filter(f => f.data_type === 'foundation_food');

  console.log(`Found ${foods.length} foundation foods`);

  console.log('Loading nutrients...');
  const allNutrients = await parseCSV<Nutrient>(`${DATA_DIR}/food_nutrient.csv`);

  const nutrientsByFood = new Map<string, Map<string, number>>();
  for (const nutrient of allNutrients) {
    if (!nutrientsByFood.has(nutrient.fdc_id)) {
      nutrientsByFood.set(nutrient.fdc_id, new Map());
    }
    nutrientsByFood.get(nutrient.fdc_id)!.set(
      nutrient.nutrient_id,
      parseFloat(nutrient.amount) || 0
    );
  }

  console.log('\nProcessing foods...\n');
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const food of foods) {
    const nutrients = nutrientsByFood.get(food.fdc_id);
    if (!nutrients || nutrients.size === 0) {
      skipCount++;
      continue;
    }

    const calories = Math.round(nutrients.get(String(NUTRIENT_IDS.CALORIES)) || 0);
    const protein = Number((nutrients.get(String(NUTRIENT_IDS.PROTEIN)) || 0).toFixed(2));
    const totalFat = nutrients.get(String(NUTRIENT_IDS.TOTAL_FAT)) || 0;
    const saturatedFat = Number((nutrients.get(String(NUTRIENT_IDS.SATURATED_FAT)) || 0).toFixed(2));
    const unsaturatedFat = Number(Math.max(0, totalFat - saturatedFat).toFixed(2));
    const carbs = Number((nutrients.get(String(NUTRIENT_IDS.CARBS)) || 0).toFixed(2));
    const sugars = Number((nutrients.get(String(NUTRIENT_IDS.SUGARS)) || 0).toFixed(2));
    const fibre = Number((nutrients.get(String(NUTRIENT_IDS.FIBER)) || 0).toFixed(2));

    // Skip if all macros are 0
    if (calories === 0 && protein === 0 && totalFat === 0 && carbs === 0) {
      skipCount++;
      continue;
    }

    let name = food.description
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\s*-\s*\d+[a-z]-\d+.*$/gi, '')
      .replace(/,\s*(non-enhanced|enhanced)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

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
        unsaturatedFat,
        saturatedFat,
        carbs,
        sugars,
        fibre,
        'usda',
        `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${food.fdc_id}/nutrients`
      ]);

      successCount++;
      if (successCount % 50 === 0) {
        console.log(`Processed ${successCount} foods...`);
      }
    } catch (error) {
      if (errorCount < 3) {
        console.error(`Error processing "${name}":`, error);
      }
      errorCount++;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Successfully added: ${successCount}`);
  console.log(`Skipped (no nutrients): ${skipCount}`);
  console.log(`Errors: ${errorCount}`);

  await pool.end();
}

populateFoundationFiltered().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
