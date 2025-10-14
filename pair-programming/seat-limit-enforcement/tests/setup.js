// Test setup and initialization
const { execSync } = require('child_process');

beforeAll(() => {
  // Initialize database before running tests
  try {
    execSync('node setup/init-db.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to initialize test database:', error);
  }
});