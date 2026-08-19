import mysql from 'mysql2/promise';

async function checkCascade() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'information_schema',
  });

  try {
    const [rows] = await pool.query(`
      SELECT CONSTRAINT_NAME, DELETE_RULE
      FROM REFERENTIAL_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = 'hirequest_db' AND TABLE_NAME = 'jobs';
    `);
    console.log(rows);
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  process.exit(0);
}

checkCascade();
