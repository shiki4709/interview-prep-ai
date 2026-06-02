import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "interview-prep.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS interviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    role_name TEXT NOT NULL,
    job_description TEXT NOT NULL,
    interviewer_name TEXT,
    interviewer_background TEXT,
    generated_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    intent TEXT,
    evaluation_criteria TEXT,
    sort_order INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    interview_id INTEGER NOT NULL,
    transcription TEXT,
    duration INTEGER,
    overall_verdict TEXT,
    feedback TEXT,
    created_at TEXT NOT NULL
  );
`);

console.log("Database initialized at:", DB_PATH);
sqlite.close();
