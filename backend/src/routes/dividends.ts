import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";

const router = Router();

const dividendSchema = z.object({
  symbol: z.string().trim().min(1).max(20).transform((s) => s.toUpperCase()),
  amount: z.number().nonnegative(),
  payDate: z.string().min(1),
  note: z.string().max(1000).optional(),
});

router.get("/", (req, res) => {
  const { symbol } = req.query;
  const rows = symbol
    ? db
        .prepare(
          "SELECT * FROM dividends WHERE symbol = ? ORDER BY pay_date DESC, id DESC"
        )
        .all(String(symbol).toUpperCase())
    : db.prepare("SELECT * FROM dividends ORDER BY pay_date DESC, id DESC").all();
  res.json(rows);
});

router.get("/summary", (req, res) => {
  const byYear = db
    .prepare(
      `SELECT strftime('%Y', pay_date) AS year, SUM(amount) AS total
       FROM dividends GROUP BY year ORDER BY year DESC`
    )
    .all();
  const bySymbol = db
    .prepare(
      `SELECT symbol, SUM(amount) AS total FROM dividends GROUP BY symbol ORDER BY total DESC`
    )
    .all();
  const byMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', pay_date) AS month, SUM(amount) AS total
       FROM dividends GROUP BY month ORDER BY month DESC LIMIT 24`
    )
    .all();
  const totalRow = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM dividends")
    .get() as { total: number };

  res.json({ total: totalRow.total, byYear, byMonth, bySymbol });
});

router.post("/", (req, res) => {
  const parsed = dividendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { symbol, amount, payDate, note } = parsed.data;

  const result = db
    .prepare(
      `INSERT INTO dividends (symbol, amount, pay_date, note) VALUES (?, ?, ?, ?)`
    )
    .run(symbol, amount, payDate, note ?? null);

  const created = db.prepare("SELECT * FROM dividends WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const result = db.prepare("DELETE FROM dividends WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Dividend not found" });
  }
  res.status(204).send();
});

export default router;
