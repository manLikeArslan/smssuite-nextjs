const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'sqlite.db');

// Ensure data directory exists if we were using it, but we'll put db in root as per User's request (implicitly via gitignore)
// For Next.js, it's often better to put it in a 'data' folder, but I'll stick to the root for simplicity in this script.

console.log('Initializing database at:', DB_PATH);

const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS stats (
    id TEXT PRIMARY KEY DEFAULT 'current',
    total_managed INTEGER DEFAULT 0,
    cold INTEGER DEFAULT 0,
    followups INTEGER DEFAULT 0,
    health INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id TEXT,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
  );

  -- Insert default stats if they don't exist
  INSERT OR IGNORE INTO stats (id, total_managed, cold, followups, health)
  VALUES ('current', 247, 0, 0, 100);
`);

console.log('Database initialized successfully.');
db.close();
