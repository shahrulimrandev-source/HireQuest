import mysql from 'mysql2/promise';

async function fixDb() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Altering status ENUM...");
    await pool.query("ALTER TABLE applications MODIFY COLUMN status ENUM('pending', 'accepted', 'rejected', 'invited') DEFAULT 'pending'");
    console.log("Success: Status ENUM updated.");
  } catch (e) {
    console.log("Error altering status ENUM:");
    console.dir(e);
  }

  try {
    console.log("Adding message column...");
    await pool.query("ALTER TABLE applications ADD COLUMN message TEXT");
    console.log("Success: Message column added.");
  } catch (e) {
    console.log("Message column might already exist:");
    console.dir(e);
  }
  
  process.exit(0);
}

fixDb();
