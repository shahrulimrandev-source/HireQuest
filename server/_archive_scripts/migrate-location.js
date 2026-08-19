import mysql from 'mysql2/promise';

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Adding location field to users table...");
    await pool.query('ALTER TABLE users ADD COLUMN location VARCHAR(255) DEFAULT NULL;');
    console.log("Migration successful.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.log("Error:", e.message);
    }
  }
  process.exit(0);
}
migrate();
