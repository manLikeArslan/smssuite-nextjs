const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'sqlite.db');

try {
  console.log('--- Database Diagnostic ---');
  console.log('Target Path:', DB_PATH);
  console.log('Process UID:', process.getuid ? process.getuid() : 'N/A');
  console.log('Process GID:', process.getgid ? process.getgid() : 'N/A');

  if (!fs.existsSync(DATA_DIR)) {
    console.log('Creating data directory...');
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } else {
    const stats = fs.statSync(DATA_DIR);
    console.log('Data Directory exists:', stats.isDirectory() ? 'Yes (is directory)' : 'No (is file!)');

    // Check writability
    try {
      fs.accessSync(DATA_DIR, fs.constants.W_OK);
      console.log('Data Directory is writable: Yes');
    } catch (e) {
      console.error('Data Directory is writable: NO');
    }
  }

  // Check if DB_PATH itself is a directory (common Docker mount error)
  if (fs.existsSync(DB_PATH) && fs.statSync(DB_PATH).isDirectory()) {
    console.error('CRITICAL: ' + DB_PATH + ' is a directory, not a file. Please delete the "sqlite.db" folder on your host machine.');
    process.exit(1);
  }

  console.log('Attempting to open database...');
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

    CREATE TABLE IF NOT EXISTS sent_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL, -- 'success' or 'error'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      list_id TEXT,
      mode TEXT,
      is_test_mode BOOLEAN,
      status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed'
      progress INTEGER DEFAULT 0,
      total_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info', -- 'info', 'success', 'error'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    -- Insert default stats if they don't exist
    INSERT OR IGNORE INTO stats (id, total_managed, cold, followups, health)
    VALUES ('current', 247, 0, 0, 100);
  `);

  console.log('Database initialized successfully.');
  db.close();
} catch (error) {
  console.error('DATABASE INIT FATAL ERROR:', error);
  process.exit(1)
}
