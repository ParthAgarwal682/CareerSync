const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'placement_cell_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Immediately test the connection
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL Database pool established successfully');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Error connecting to MySQL pool:', err.message);
  });

module.exports = pool;
