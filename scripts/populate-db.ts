import { config } from 'dotenv';
import { Pool } from 'pg';
import { searchUSDAFood } from '../src/lib/usda';

// Load environment variables from .env.local
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Core fundamental foods that people commonly search for
const FUNDAMENTAL_FOODS = [
  // Proteins
  'chicken breast',
  'chicken thigh',
  'fried chicken',
  'grilled chicken',
  'baked chicken',
  'ground beef',
  'steak',
  'pork chop',
  'bacon',
  'salmon',
  'tuna',
  'shrimp',
  'eggs',
  'egg whites',
  'tofu',

  // Carbs
  'white rice',
  'brown rice',
  'boiled rice',
  'pasta',
  'spaghetti',
  'bread',
  'white bread',
  'whole wheat bread',
  'potato',
  'baked potato',
  'french fries',
  'sweet potato',
  'oatmeal',
  'quinoa',

  // Vegetables
  'broccoli',
  'spinach',
  'carrots',
  'tomato',
  'lettuce',
  'cucumber',
  'bell pepper',
  'onion',
  'garlic',
  'green beans',
  'cauliflower',
  'asparagus',

  // Fruits
  'banana',
  'apple',
  'orange',
  'strawberries',
  'blueberries',
  'grapes',
  'watermelon',
  'mango',
  'pineapple',
  'avocado',

  // Dairy
  'milk',
  'skim milk',
  'whole milk',
  'yogurt',
  'greek yogurt',
  'cheese',
  'cheddar cheese',
  'mozzarella cheese',
  'cottage cheese',
  'butter',

  // Nuts & Seeds
  'almonds',
  'peanuts',
  'peanut butter',
  'walnuts',
  'cashews',
  'chia seeds',
  'flax seeds',

  // Common prepared foods
  'pizza',
  'burger',
  'sandwich',
  'burrito',
  'taco',
  'salad',
];

async function populateDatabase() {
  console.log(`Starting to populate database with ${FUNDAMENTAL_FOODS.length} fundamental foods...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const foodName of FUNDAMENTAL_FOODS) {
    try {
      console.log(`Fetching: ${foodName}...`);

      // Use searchUSDAFood which internally gets the best match
      const foodData = await searchUSDAFood(foodName);

      if (foodData) {
        await pool.query(
          `INSERT INTO foods (
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
            source_url = EXCLUDED.source_url`,
          [
            foodData.name,
            foodData.portionSize,
            foodData.macros.calories,
            foodData.macros.protein,
            foodData.macros.unsaturatedFat,
            foodData.macros.saturatedFat,
            foodData.macros.carbs,
            foodData.macros.sugars,
            foodData.macros.fibre,
            foodData.source,
            foodData.sourceUrl || null
          ]
        );
        console.log(`✓ Saved: ${foodData.name}`);
        successCount++;
      } else {
        console.log(`✗ Not found: ${foodName}`);
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`✗ Error with ${foodName}:`, error);
      failCount++;
    }
  }

  console.log(`\n=== Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  await pool.end();
}

populateDatabase().catch(console.error);
