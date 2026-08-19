import pool from './server/db.js';

async function alterDB() {
  try {
    await pool.query("ALTER TABLE applications MODIFY status ENUM('pending', 'accepted', 'rejected', 'invited', 'finished', 'success') DEFAULT 'pending'");
    console.log('Database altered successfully.');
  } catch (error) {
    console.error('Error altering database:', error);
  } finally {
    process.exit();
  }
}

alterDB();
