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

// Helper to safely prepare statements
function safePrepare(sql: string) {
  try {
    return db.prepare(sql);
  } catch (e: any) {
    console.error(`[DB] Failed to prepare statement: ${sql}\nError: ${e.message}`);
    return null;
  }
}

// Prepared Statements for common operations
export const getStats = safePrepare("SELECT * FROM stats WHERE id = 'current'") as any;
export const updateStats = safePrepare(`
  UPDATE stats 
  SET total_managed = ?, cold = ?, followups = ?, health = ? 
  WHERE id = 'current'
`) as any;

export const getAllLists = safePrepare("SELECT id, name, count, created_at as createdAt FROM lists ORDER BY created_at DESC") as any;
export const getListById = safePrepare("SELECT id, name, count, created_at as createdAt FROM lists WHERE id = ?") as any;
export const createList = safePrepare("INSERT INTO lists (id, name, count) VALUES (?, ?, ?)") as any;
export const deleteList = safePrepare("DELETE FROM lists WHERE id = ?") as any;

export const getContactsByList = safePrepare("SELECT * FROM contacts WHERE list_id = ?") as any;
export const addContact = safePrepare("INSERT INTO contacts (list_id, phone, status) VALUES (?, ?, ?)") as any;
export const getTotalContactCount = safePrepare("SELECT COUNT(*) as count FROM contacts") as any;
export const getStatusCount = safePrepare("SELECT COUNT(*) as count FROM contacts WHERE status = ?") as any;

export default db;
