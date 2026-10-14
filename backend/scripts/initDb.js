const { initializeSchema } = require('../config/db');

async function run() {
  console.log('Initializing CineVault MySQL Database Schema...');
  const result = await initializeSchema();
  if (result.success) {
    console.log('✅ Database initialization complete!');
  } else {
    console.error('❌ Database initialization failed:', result.error || result.message);
  }
  process.exit(result.success ? 0 : 1);
}

run();
