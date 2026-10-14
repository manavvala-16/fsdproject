const { testConnection } = require('../config/db');

/**
 * Health check controller
 * Verifies Express server and MySQL database connection status
 */
exports.getHealthStatus = async (req, res, next) => {
  try {
    const dbStatus = await testConnection();

    res.status(200).json({
      success: true,
      message: 'CineVault API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus.connected ? 'Connected' : 'Disconnected',
        name: dbStatus.database,
        host: dbStatus.host,
        port: dbStatus.port,
        tablesCount: dbStatus.tablesCount || 0,
        tables: dbStatus.tables || [],
        details: dbStatus.message,
        error: dbStatus.error || null
      }
    });
  } catch (error) {
    next(error);
  }
};
