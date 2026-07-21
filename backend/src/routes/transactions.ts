import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";

const router = Router();

const transactionSchema = z.object({
  symbol: z.string().trim().min(1).max(20).transform((s) => s.toUpperCase()),
  name: z.string().trim().max(200).optional(),
  type: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  fee: z.number().nonnegative().default(0),
  tradeDate: z.string().min(1),
  note: z.string().max(1000).optional(),
});

router.get("/", (req, res) => {
  const { symbol } = req.query;
  const rows = symbol
    ? db
        .prepare(
          "SELECT * FROM transactions WHERE symbol = ? ORDER BY trade_date DESC, id DESC"
        )
        .all(String(symbol).toUpperCase())
    : db
        .prepare("SELECT * FROM transactions ORDER BY trade_date DESC, id DESC")
        .all();
  res.json(rows);
});

router.post("/", (req, res) => {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { symbol, name, type, quantity, price, fee, tradeDate, note } = parsed.data;

  const result = db
    .prepare(
      `INSERT INTO transactions (symbol, name, type, quantity, price, fee, trade_date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(symbol, name ?? null, type, quantity, price, fee, tradeDate, note ?? null);

  const created = db
    .prepare("SELECT * FROM transactions WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(created);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { symbol, name, type, quantity, price, fee, tradeDate, note } = parsed.data;

  const result = db
    .prepare(
      `UPDATE transactions
       SET symbol = ?, name = ?, type = ?, quantity = ?, price = ?, fee = ?, trade_date = ?, note = ?
       WHERE id = ?`
    )
    .run(symbol, name ?? null, type, quantity, price, fee, tradeDate, note ?? null, id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  const updated = db.prepare("SELECT * FROM transactions WHERE id = ?").get(id);
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const result = db.prepare("DELETE FROM transactions WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  res.status(204).send();
});

export default router;
