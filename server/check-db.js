import mysql from 'mysql2/promise';

async function checkDb() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    const [users] = await pool.query("SELECT id, name, role FROM users");
    console.log("USERS:", users);
    const [jobs] = await pool.query("SELECT id, title, company_id FROM jobs");
    console.log("JOBS:", jobs);
  } catch (e) {
    console.log(e);
  }
  
  process.exit(0);
}

checkDb();
