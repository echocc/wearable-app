import { readFileSync } from 'fs';
import { join } from 'path';
import { getPool } from '../lib/db';

async function runMigrations() {
  const pool = getPool();

  try {
    console.log('Running database migrations...');

    const migrationPath = join(__dirname, 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    await pool.query(migrationSQL);

    console.log('✓ Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
