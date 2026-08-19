import pool from './db.js';

async function setupInterviewsTable() {
  try {
    console.log('Creating interviews table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT NOT NULL,
        company_id INT NOT NULL,
        seeker_id INT NOT NULL,
        scheduled_date DATETIME NOT NULL,
        type ENUM('online', 'in-person') NOT NULL,
        link_or_location VARCHAR(255) NOT NULL,
        status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (seeker_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Interviews table created successfully.');
  } catch (error) {
    console.error('Error creating interviews table:', error);
  } finally {
    process.exit();
  }
}

setupInterviewsTable();
