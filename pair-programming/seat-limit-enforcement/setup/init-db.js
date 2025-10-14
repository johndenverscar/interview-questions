const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    organization_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Organizations table with license info
  db.run(`CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    seat_limit INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Active sessions table
  db.run(`CREATE TABLE IF NOT EXISTS active_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Audit log for seat activities
  db.run(`CREATE TABLE IF NOT EXISTS seat_audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER NOT NULL,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert test data
  db.run(`INSERT OR REPLACE INTO organizations (id, name, seat_limit) VALUES
    (1, 'Acme Corp', 10),
    (2, 'TechStart Inc', 50),
    (3, 'Small Biz LLC', 5)`);

  db.run(`INSERT OR REPLACE INTO users (id, username, email, password_hash, organization_id) VALUES
    (1, 'john_doe', 'john@acme.com', '$2b$10$example', 1),
    (2, 'jane_smith', 'jane@acme.com', '$2b$10$example', 1),
    (3, 'bob_wilson', 'bob@techstart.com', '$2b$10$example', 2),
    (4, 'alice_brown', 'alice@smallbiz.com', '$2b$10$example', 3),
    (5, 'charlie_davis', 'charlie@smallbiz.com', '$2b$10$example', 3)`);
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err);
  } else {
    console.log('Database initialized successfully!');
  }
});