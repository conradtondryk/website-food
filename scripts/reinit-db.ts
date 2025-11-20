import { config } from 'dotenv';
config({ path: '.env.local' });

async function run() {
  const { initDatabase } = await import('../src/lib/db');
  console.log('Re-initializing database...');
  await initDatabase();
  console.log('Done.');
  process.exit(0);
}

run().catch(console.error);
