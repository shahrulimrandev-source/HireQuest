import pool from './server/db.js';

async function fixEmpty() {
  try {
    await pool.query("UPDATE applications SET status = 'finished' WHERE status = ''");
    console.log('Fixed empty statuses');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fixEmpty();
