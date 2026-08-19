import mysql from 'mysql2/promise';

async function migratePosts() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hirequest_db',
  });

  try {
    console.log("Creating company_posts table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_posts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          caption TEXT,
          media_url VARCHAR(255),
          media_type ENUM('image', 'video', 'text') DEFAULT 'text',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Success!");
  } catch (e) {
    console.log("Error:", e.message);
  }
  
  process.exit(0);
}

migratePosts();
