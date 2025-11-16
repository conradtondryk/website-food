import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`DROP TABLE IF EXISTS foods CASCADE`);

    await client.query(`
      CREATE TABLE foods (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        portion_size VARCHAR(50) NOT NULL,
        calories INTEGER NOT NULL,
        protein DECIMAL(5,2) NOT NULL,
        unsaturated_fat DECIMAL(5,2) NOT NULL,
        saturated_fat DECIMAL(5,2) NOT NULL,
        carbs DECIMAL(5,2) NOT NULL,
        sugars DECIMAL(5,2) NOT NULL,
        fibre DECIMAL(5,2) NOT NULL,
        source VARCHAR(10) NOT NULL DEFAULT 'ai',
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX idx_foods_name ON foods(LOWER(name))
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getFoodByName(name: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM foods WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting food from database:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function searchFoodsInDatabase(query: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM foods WHERE LOWER(name) LIKE LOWER($1) ORDER BY LENGTH(name) LIMIT 5',
      [`%${query}%`]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching foods in database:', error);
    return [];
  } finally {
    client.release();
  }
}

export async function saveFoodToDatabase(foodData: {
  name: string;
  portionSize: string;
  macros: {
    calories: number;
    protein: number;
    unsaturatedFat: number;
    saturatedFat: number;
    carbs: number;
    sugars: number;
    fibre: number;
  };
  source: 'usda' | 'ai';
  sourceUrl?: string;
}) {
  const client = await pool.connect();
  try {
    const result = await client.query(
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
        source_url = EXCLUDED.source_url
      RETURNING *`,
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
        foodData.sourceUrl || null,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving food to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export function mapDatabaseRowToFoodItem(row: any) {
  return {
    name: row.name,
    portionSize: row.portion_size,
    macros: {
      calories: Number(row.calories),
      protein: Number(row.protein),
      unsaturatedFat: Number(row.unsaturated_fat),
      saturatedFat: Number(row.saturated_fat),
      carbs: Number(row.carbs),
      sugars: Number(row.sugars),
      fibre: Number(row.fibre),
    },
    source: row.source || 'ai',
    sourceUrl: row.source_url || undefined,
  };
}
