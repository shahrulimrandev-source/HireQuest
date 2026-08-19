import pool from './server/db.js';

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seeker_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        seeker_id INT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        issuer VARCHAR(255),
        issue_date VARCHAR(50),
        skills_extracted TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Table seeker_certificates created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating table:", error);
    process.exit(1);
  }
}

setup();
