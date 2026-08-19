import mysql from 'mysql2/promise';

// Configure the MySQL database connection
// Assuming default XAMPP settings (root user, empty password)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'hirequest_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
