const Database = require('better-sqlite3');

const db = new Database('movies.db');

db.pragma('journal_mode = WAL');

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS movies (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    year       INTEGER NOT NULL,
    genre      TEXT NOT NULL,
    poster     TEXT,
    rating     TEXT,
    rated      TEXT,
    runtime    TEXT,
    director   TEXT,
    actors     TEXT,
    plot       TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;
db.exec(createTableQuery);

module.exports = db;