import mysql from 'mysql2/promise';

async function migrateUnread() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Adding is_read column to messages...");
    await pool.query(`
      ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    `);
    console.log("Success!");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
       console.log("Column already exists.");
    } else {
       console.log("Error:", e.message);
    }
  }
  
  process.exit(0);
}

migrateUnread();
