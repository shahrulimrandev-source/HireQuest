import mysql from 'mysql2/promise';

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Creating messages table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          application_id INT NOT NULL,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Success!");
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  process.exit(0);
}

migrate();
