const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'hirequest_db' });
  
  // Create a fake job for company 1 if it doesn't exist
  await pool.query('INSERT IGNORE INTO jobs (id, company_id, title) VALUES (999, 1, "Test Job")');
  
  // Insert an application for seeker 11 (the one we tested before) to job 999
  await pool.query('INSERT IGNORE INTO applications (id, job_id, seeker_id, status) VALUES (999, 999, 11, "pending")');
  
  const [rows] = await pool.query(`
      SELECT applications.*, users.name, users.email, users.bio as seekerBio, users.education_level as seekerEducation, users.skills as seekerSkills, users.embedding as seekerEmbedding, users.profile_picture, users.banner, users.resume, users.certificate, jobs.title as jobTitle, jobs.skills as jobSkills, jobs.embedding as jobEmbedding,
      (SELECT COUNT(*) FROM messages WHERE messages.application_id = applications.id AND messages.receiver_id = jobs.company_id AND messages.is_read = FALSE) as unreadCount
      FROM applications
      JOIN users ON applications.seeker_id = users.id
      JOIN jobs ON applications.job_id = jobs.id
      WHERE jobs.company_id = ?
    `, [1]);
  console.log(rows[0]);
  process.exit(0);
}

test();
