import { sql } from '@vercel/postgres';
import { Pool } from 'pg';

// Use pg Pool for local development, Vercel will use @vercel/postgres
const pool = process.env.VERCEL
  ? null
  : new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

async function query(queryText: string, values?: any[]): Promise<{ rows: any[] }> {
  if (process.env.VERCEL) {
    // On Vercel, use @vercel/postgres
    return await sql.query(queryText, values || []);
  } else {
    // Locally, use pg Pool
    return await pool!.query(queryText, values);
  }
}

export async function initDatabase() {
  try {
    await sql`DROP TABLE IF EXISTS foods CASCADE`;

    await sql`
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
    `;

    await sql`CREATE INDEX idx_foods_name ON foods(LOWER(name))`;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function getFoodByName(name: string) {
  try {
    const result = await query(
      'SELECT * FROM foods WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting food from database:', error);
    return null;
  }
}

export async function searchFoodsInDatabase(searchQuery: string) {
  try {
    // Split search query into individual words for fuzzy matching
    const words = searchQuery.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);

    if (words.length === 0) {
      return [];
    }

    // Build WHERE clause requiring all words to be present
    const whereConditions = words.map((_, index) => `LOWER(name) LIKE $${index + 1}`).join(' AND ');
    const wordPatterns = words.map(word => `%${word}%`);

    // Build ORDER BY for better relevance ranking
    const exactPattern = searchQuery;
    const commaPattern = `${searchQuery},%`;
    const spacePattern = `${searchQuery} %`;

    const paramCount = words.length;
    const result = await query(
      `SELECT * FROM foods
       WHERE ${whereConditions}
       ORDER BY
         CASE
           -- Exact match is always first
           WHEN LOWER(name) = LOWER($${paramCount + 1}) THEN 1
           -- Short simple names (1-2 words) for single-word searches
           WHEN array_length(string_to_array(name, ' '), 1) <= 2 THEN 2
           -- Common cooking methods (useful for multi-word searches)
           WHEN LOWER(name) ~ '\\y(fried|grilled|baked|roasted|cooked|boiled|steamed|raw)\\y' THEN 3
           -- Then starts with patterns
           WHEN LOWER(name) LIKE LOWER($${paramCount + 2}) THEN 4
           WHEN LOWER(name) LIKE LOWER($${paramCount + 3}) THEN 5
           -- Everything else last
           ELSE 6
         END,
         -- Within same priority: prefer shorter, simpler names
         LENGTH(name),
         array_length(string_to_array(name, ' '), 1)
       LIMIT 5`,
      [...wordPatterns, exactPattern, commaPattern, spacePattern]
    );
    return result.rows;
  } catch (error) {
    console.error('Error searching foods in database:', error);
    return [];
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
  try {
    const result = await sql`
      INSERT INTO foods (
        name, portion_size, calories, protein,
        unsaturated_fat, saturated_fat, carbs, sugars, fibre,
        source, source_url
      )
      VALUES (
        ${foodData.name},
        ${foodData.portionSize},
        ${foodData.macros.calories},
        ${foodData.macros.protein},
        ${foodData.macros.unsaturatedFat},
        ${foodData.macros.saturatedFat},
        ${foodData.macros.carbs},
        ${foodData.macros.sugars},
        ${foodData.macros.fibre},
        ${foodData.source},
        ${foodData.sourceUrl || null}
      )
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
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error saving food to database:', error);
    throw error;
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
