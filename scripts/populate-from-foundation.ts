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

// Nutrient IDs we care about
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

interface FoodPortionCSV {
    fdc_id: string;
    amount: string;
    measure_unit_id: string;
    portion_description: string;
    modifier: string;
    gram_weight: string;
}

interface MeasureUnitCSV {
    id: string;
    name: string;
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

async function populateFromFoundation() {
  console.log('Loading Sample Foods...');

  // Load sample food IDs
  const sampleFoods = await parseCSV<{ fdc_id: string }>(`${DATA_DIR}/foundation_food.csv`);
  const sampleIds = new Set(sampleFoods.map(f => f.fdc_id));
  console.log(`Found ${sampleIds.size} foundation foods`);

  // Load all foods
  const allFoods = await parseCSV<Food>(`${DATA_DIR}/food.csv`);

  // Filter to only sample foods
  const foods = allFoods.filter(f => sampleIds.has(f.fdc_id));
  console.log(`Matched ${foods.length} foods`);

  // Load all nutrients
  console.log('Loading nutrients...');
  const allNutrients = await parseCSV<Nutrient>(`${DATA_DIR}/food_nutrient.csv`);

  // Group nutrients by food ID
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
  
  // Load measures and portions
  console.log('Loading portions...');
  const measureUnits = await parseCSV<MeasureUnitCSV>(`${DATA_DIR}/measure_unit.csv`);
  const measureUnitMap = new Map(measureUnits.map(m => [m.id, m.name]));

  const allPortions = await parseCSV<FoodPortionCSV>(`${DATA_DIR}/food_portion.csv`);
  const portionsByFood = new Map<string, any[]>();

  for (const portion of allPortions) {
    if (!portionsByFood.has(portion.fdc_id)) {
        portionsByFood.set(portion.fdc_id, []);
    }
    
    const unitName = measureUnitMap.get(portion.measure_unit_id) || 'unit';
    let label = portion.portion_description;
    if (!label) {
        const amount = parseFloat(portion.amount);
        const modifier = portion.modifier ? `, ${portion.modifier}` : '';
        label = `${amount} ${unitName}${modifier}`;
    }
    
    portionsByFood.get(portion.fdc_id)!.push({
        amount: parseFloat(portion.amount) || 1,
        unit: label,
        gramWeight: parseFloat(portion.gram_weight) || 0
    });
  }


  console.log('\nProcessing foods...');
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const food of foods) {
    const nutrients = nutrientsByFood.get(food.fdc_id);
    if (!nutrients) {
      skipCount++;
      continue;
    }

    // Get nutrient values (per 100g in Sample Foods)
    const calories = Math.round(nutrients.get(String(NUTRIENT_IDS.CALORIES)) || 0);
    const protein = Number((nutrients.get(String(NUTRIENT_IDS.PROTEIN)) || 0).toFixed(2));
    const totalFat = nutrients.get(String(NUTRIENT_IDS.TOTAL_FAT)) || 0;
    const saturatedFat = Number((nutrients.get(String(NUTRIENT_IDS.SATURATED_FAT)) || 0).toFixed(2));
    const unsaturatedFat = Number(Math.max(0, totalFat - saturatedFat).toFixed(2));
    const carbs = Number((nutrients.get(String(NUTRIENT_IDS.CARBS)) || 0).toFixed(2));
    const sugars = Number((nutrients.get(String(NUTRIENT_IDS.SUGARS)) || 0).toFixed(2));
    const fibre = Number((nutrients.get(String(NUTRIENT_IDS.FIBER)) || 0).toFixed(2));

    // Clean up food name
    let name = food.description
      .toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheses
      .replace(/\s*-\s*\d+[a-z]-\d+.*$/gi, '') // Remove sample codes
      .replace(/,\s*(non-enhanced|enhanced)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    // Get portions
    const rawPortions = portionsByFood.get(food.fdc_id) || [];
    const portions = rawPortions.map(p => ({
        amount: p.amount,
        unit: p.unit, // This is the label constructed above
        gramWeight: p.gramWeight
    })).filter(p => p.gramWeight > 0);
    
    // Add standard 100g portion
    portions.push({ amount: 1, unit: '100g', gramWeight: 100 });
    
    // Sort portions by weight
    portions.sort((a, b) => a.gramWeight - b.gramWeight);

    try {
      await pool.query(`
        INSERT INTO foods (
          name, portion_size, portions, calories, protein,
          unsaturated_fat, saturated_fat, carbs, sugars, fibre,
          source, source_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (name) DO UPDATE SET
          portion_size = EXCLUDED.portion_size,
          portions = EXCLUDED.portions,
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
        JSON.stringify(portions),
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
      if (successCount % 100 === 0) {
        console.log(`Processed ${successCount} foods...`);
      }
    } catch (error) {
      // Log first few errors to see what's wrong
      if (errorCount < 3) {
        console.error(`Error #${errorCount + 1}:`, error);
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

populateFromFoundation().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
