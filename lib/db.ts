import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'leads.db');
const db = new Database(dbPath);

// Initialize DB
db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        phone TEXT,
        email TEXT,
        treatment_type TEXT,
        preferred_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        source TEXT,
        status TEXT DEFAULT 'pending',
        vision_result TEXT
    )
`);

export default db;
