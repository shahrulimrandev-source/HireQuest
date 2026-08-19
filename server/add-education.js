import mysql from 'mysql2/promise';

async function addEducationColumn() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Adding education_level column to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN education_level VARCHAR(100) DEFAULT NULL");
    console.log("Success: education_level column added.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Column already exists.");
    } else {
      console.log("Error adding column:", e.message);
    }
  }
  
  process.exit(0);
}

addEducationColumn();
