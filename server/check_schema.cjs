const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'hirequest_db'
    });
    
    const [rows] = await pool.query('DESCRIBE seeker_certificates');
    console.log("Schema:", rows);
    process.exit(0);
  } catch(e) {
    console.error("DB Error:", e);
    process.exit(1);
  }
}

run();
