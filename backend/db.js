const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

// Initialize DB and create tables if they don't exist
async function initDB() {
  try {
    // Create database if not exists
    const rawPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }).promise();

    await rawPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    console.log(`✅ Database "${process.env.DB_NAME}" ready`);

    // Create tasks table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        text VARCHAR(500) NOT NULL,
        checked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tasks table ready");
  } catch (err) {
    console.error("❌ DB init error:", err.message);
    process.exit(1);
  }
}

module.exports = { promisePool, initDB };
