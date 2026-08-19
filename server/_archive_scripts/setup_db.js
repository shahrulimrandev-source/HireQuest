import pool from './db.js';

async function setupDB() {
  try {
    console.log('Altering users table...');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS skills TEXT, ADD COLUMN IF NOT EXISTS bio TEXT, ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255), ADD COLUMN IF NOT EXISTS resume VARCHAR(255), ADD COLUMN IF NOT EXISTS certificate VARCHAR(255);');
    
    console.log('Altering jobs table...');
    await pool.query('ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills TEXT;');

    console.log('Database altered successfully.');
  } catch (error) {
    console.error('Error altering database:', error);
  } finally {
    process.exit();
  }
}

setupDB();
