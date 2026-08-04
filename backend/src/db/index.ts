import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH ?? path.join(dataDir, "portfolio.db");
export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    name TEXT,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity REAL NOT NULL CHECK (quantity > 0),
    price REAL NOT NULL CHECK (price >= 0),
    fee REAL NOT NULL DEFAULT 0,
    trade_date TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
  CREATE INDEX IF NOT EXISTS idx_transactions_trade_date ON transactions(trade_date);

  CREATE TABLE IF NOT EXISTS dividends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    amount REAL NOT NULL CHECK (amount >= 0),
    pay_date TEXT NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_dividends_symbol ON dividends(symbol);
  CREATE INDEX IF NOT EXISTS idx_dividends_pay_date ON dividends(pay_date);
`);
