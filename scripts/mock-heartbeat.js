const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'sqlite.db');
const db = new Database(dbPath);

console.log('Generating mock heartbeat data...');

const statuses = ['success', 'success', 'success', 'error'];

for (let i = 0; i < 100; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    // Randomize date within the last 24 hours
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 19).replace('T', ' ');

    db.prepare("INSERT INTO sent_events (status, created_at) VALUES (?, ?)").run(status, dateStr);
}

console.log('Done.');
db.close();
