import mysql from 'mysql2/promise';

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Adding new fields to users table...");
    await pool.query('ALTER TABLE users ADD COLUMN phone_number VARCHAR(100) DEFAULT NULL;');
    await pool.query('ALTER TABLE users ADD COLUMN website_link VARCHAR(255) DEFAULT NULL;');
    await pool.query('ALTER TABLE users ADD COLUMN linkedin_link VARCHAR(255) DEFAULT NULL;');
    console.log("Migration successful.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.log("Error:", e.message);
    }
  }
  process.exit(0);
}
migrate();
