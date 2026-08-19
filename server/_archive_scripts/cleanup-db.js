import mysql from 'mysql2/promise';

async function fixCorruptedData() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Deleting jobs created by seekers...");
    const [result] = await pool.query(`
      DELETE jobs FROM jobs 
      JOIN users ON jobs.company_id = users.id 
      WHERE users.role != 'company'
    `);
    console.log(`Deleted ${result.affectedRows} corrupted jobs.`);
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  process.exit(0);
}

fixCorruptedData();
