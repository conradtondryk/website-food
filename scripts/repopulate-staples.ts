import { config } from 'dotenv';
import { Pool } from 'pg';
import { searchUSDAFood } from '../src/lib/usda';

config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// List of staples that were likely deleted or need quality checks
// These are generic, high-quality search terms for FNDDS
const STAPLES = [
    // Legumes (often broken in Foundation)
    'black beans, cooked',
    'pinto beans, cooked',
    'kidney beans, cooked',
    'lentils, cooked',
    'chickpeas, cooked',
    'navy beans, cooked',
    'white beans, cooked',

    // Oils (often broken)
    'canola oil',
    'olive oil',
    'corn oil',
    'vegetable oil',
    'coconut oil',
    'butter, salted',

    // Grains
    'white rice, cooked',
    'brown rice, cooked',
    'quinoa, cooked',
    'oats, cooked',
    'pasta, cooked',
    'whole wheat pasta, cooked',

    // Basics
    'chicken breast, roasted',
    'ground beef, cooked',
    'salmon, cooked',
    'egg, hard boiled',
    'apple, raw',
    'banana, raw',
    'broccoli, cooked',
    'spinach, raw'
];

async function repopulateStaples() {
    console.log(`Starting slow repopulation of ${STAPLES.length} staples...`);
    console.log('Using FNDDS data via USDA API (5s delay between requests to avoid rate limits)\n');

    let successCount = 0;
    let failCount = 0;

    for (const foodName of STAPLES) {
        try {
            process.stdout.write(`Fetching: ${foodName}... `);

            const foodData = await searchUSDAFood(foodName);

            if (foodData && foodData.macros.calories > 0) {
                await pool.query(
                    `INSERT INTO foods (
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
            source_url = EXCLUDED.source_url`,
                    [
                        foodData.name,
                        foodData.portionSize,
                        JSON.stringify(foodData.portions || []),
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
                console.log(`✓ Saved (${foodData.macros.calories} kcal)`);
                successCount++;
            } else {
                console.log(`✗ Failed or 0 calories`);
                failCount++;
            }

            // 5 second delay to respect DEMO_KEY limits
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error) {
            console.log(`✗ Error`);
            console.error(error);
            failCount++;
            // Wait even longer on error
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    console.log(`\n=== Complete ===`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);

    await pool.end();
}

repopulateStaples();

