const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'server/.env' });

async function checkDatabase() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hirequest_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const [tables] = await pool.query("SHOW TABLES");
    const tableKey = Object.keys(tables[0])[0];
    
    console.log('--- DATABASE DIAGNOSTICS ---');
    console.log(`Found ${tables.length} tables in database.`);

    for (let i = 0; i < tables.length; i++) {
      const tableName = tables[i][tableKey];
      const [rows] = await pool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      
      // Get table schema
      const [schema] = await pool.query(`DESCRIBE ${tableName}`);
      const columns = schema.map(s => s.Field).join(', ');

      console.log(`\n✅ Table: ${tableName} (${rows[0].count} rows)`);
      console.log(`   Columns: ${columns}`);
      
      // Special check for CASCADE deletes
      if (tableName === 'applications') {
        const [fks] = await pool.query(`
          SELECT CONSTRAINT_NAME, UPDATE_RULE, DELETE_RULE 
          FROM information_schema.REFERENTIAL_CONSTRAINTS 
          WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'applications'
        `);
        if (fks.length > 0) {
           console.log(`   Foreign Keys: ${fks.map(f => `${f.CONSTRAINT_NAME} (Delete: ${f.DELETE_RULE})`).join(', ')}`);
        }
      }
    }
    
    // Test basic retrieval logic (Users)
    const [users] = await pool.query(`SELECT role, COUNT(*) as count FROM users GROUP BY role`);
    console.log('\n--- DATA INTEGRITY ---');
    users.forEach(u => console.log(`Role '${u.role}': ${u.count} users`));
    
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    pool.end();
  }
}

checkDatabase();
