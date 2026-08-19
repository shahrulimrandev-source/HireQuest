import pool from './server/db.js';

async function check() {
  try {
    const [rows] = await pool.query("DESCRIBE applications;");
    console.log(rows);
    const [rows2] = await pool.query("SHOW TABLES;");
    console.log(rows2);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
check();
