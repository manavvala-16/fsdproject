const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Set DB_SSL_CA to the database provider's CA certificate (PEM) to enable
// certificate-verified TLS for hosted MySQL. Leave unset for local MySQL.
const sslConfig = process.env.DB_SSL_CA
  ? { ca: process.env.DB_SSL_CA.replace(/\\n/g, '\n'), rejectUnauthorized: true }
  : undefined;

// Default configuration with environment variables fallback
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'cinevault',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  ...(sslConfig ? { ssl: sslConfig } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create the connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test database connection and return detailed status object
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 + 1 AS testResult');
    
    // Check if cinevault tables exist
    const [tables] = await connection.query('SHOW TABLES');
    const tableList = tables.map(t => Object.values(t)[0]);
    
    connection.release();
    
    return {
      connected: true,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      tablesCount: tableList.length,
      tables: tableList,
      message: 'MySQL database connection established successfully'
    };
  } catch (error) {
    return {
      connected: false,
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      error: error.message,
      code: error.code,
      message: 'Failed to connect to MySQL database'
    };
  }
}

/**
 * Helper to initialize database tables and seed data if database exists
 */
async function initializeSchema() {
  try {
    // First connect without specifying database to create 'cinevault' if needed
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      ...(sslConfig ? { ssl: sslConfig } : {}),
      multipleStatements: true
    });
    
    const schemaSqlPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaSqlPath)) {
      const sql = fs.readFileSync(schemaSqlPath, 'utf8');
      await rootConn.query(sql);
      await rootConn.end();
      return { success: true, message: 'Database schema initialized successfully' };
    }
    await rootConn.end();
    return { success: false, message: 'schema.sql file not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  pool,
  testConnection,
  initializeSchema,
  dbConfig
};
