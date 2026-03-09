import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "sqlite.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Prepared Statements for common operations
export const getStats = db.prepare("SELECT * FROM stats WHERE id = 'current'");
export const updateStats = db.prepare(`
  UPDATE stats 
  SET total_managed = ?, cold = ?, followups = ?, health = ? 
  WHERE id = 'current'
`);

export const getAllLists = db.prepare("SELECT id, name, count, created_at as createdAt FROM lists ORDER BY created_at DESC");
export const getListById = db.prepare("SELECT id, name, count, created_at as createdAt FROM lists WHERE id = ?");
export const createList = db.prepare("INSERT INTO lists (id, name, count) VALUES (?, ?, ?)");
export const deleteList = db.prepare("DELETE FROM lists WHERE id = ?");

export const getContactsByList = db.prepare("SELECT * FROM contacts WHERE list_id = ?");
export const addContact = db.prepare("INSERT INTO contacts (list_id, phone, status) VALUES (?, ?, ?)");
export const getTotalContactCount = db.prepare("SELECT COUNT(*) as count FROM contacts");
export const getStatusCount = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE status = ?");

export default db;
