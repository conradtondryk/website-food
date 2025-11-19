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

async function exportMyFoodData() {
  try {
    console.log('Exporting MyFoodData foods to JSON...');

    const result = await pool.query('SELECT * FROM foods WHERE source = $1 ORDER BY name', ['myfooddata']);

    const jsonData = JSON.stringify(result.rows, null, 2);
    const outputPath = '/Users/conradtondryk/Downloads/myfooddata-backup.json';

    fs.writeFileSync(outputPath, jsonData);

    console.log(`\nExported ${result.rows.length} foods to ${outputPath}`);
    console.log(`File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    await pool.end();
  } catch (error) {
    console.error('Error exporting data:', error);
    await pool.end();
    process.exit(1);
  }
}

exportMyFoodData();
