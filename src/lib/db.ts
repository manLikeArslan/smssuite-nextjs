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
export const getContactsByStatus = safePrepare("SELECT * FROM contacts WHERE list_id = ? AND status = ?") as any;
export const updateContactStatus = safePrepare("UPDATE contacts SET status = ? WHERE list_id = ? AND phone = ?") as any;
export const addContact = safePrepare("INSERT INTO contacts (list_id, phone, status) VALUES (?, ?, ?)") as any;
export const getTotalContactCount = safePrepare("SELECT COUNT(*) as count FROM contacts") as any;
export const getStatusCount = safePrepare("SELECT COUNT(*) as count FROM contacts WHERE status = ?") as any;

export const logSentEvent = safePrepare("INSERT INTO sent_events (status) VALUES (?)") as any;

export const getActiveSession = safePrepare("SELECT * FROM sessions WHERE status = 'active' LIMIT 1") as any;
export const createSession = safePrepare(`
  INSERT INTO sessions (id, list_id, mode, is_test_mode, status, total_count)
  VALUES (?, ?, ?, ?, 'active', ?)
`) as any;
export const updateSessionProgress = safePrepare(`
  UPDATE sessions 
  SET progress = ?, updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`) as any;
export const updateSessionStatus = safePrepare(`
  UPDATE sessions 
  SET status = ?, updated_at = CURRENT_TIMESTAMP 
  WHERE id = ?
`) as any;
export const getSessionById = safePrepare("SELECT * FROM sessions WHERE id = ?") as any;

export const addSessionLog = safePrepare(`
  INSERT INTO session_logs (session_id, message, type)
  VALUES (?, ?, ?)
`) as any;
export const getSessionLogs = safePrepare(`
  SELECT message as msg, type, strftime('%H:%M:%S', created_at) as time 
  FROM session_logs 
  WHERE session_id = ? 
  ORDER BY created_at DESC
`) as any;

export const getHeartbeatStats = safePrepare(`
  SELECT 
    strftime('%Y-%m-%d %H:00:00', created_at) as hour,
    COUNT(*) as count
  FROM sent_events 
  WHERE created_at >= datetime('now', '-24 hours')
  GROUP BY hour
  ORDER BY hour ASC
`) as any;

export default db;
