import { Router } from "express";
import { getQuote, searchSymbol } from "../services/quoteService.js";

const router = Router();

router.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json([]);
  try {
    const results = await searchSymbol(q);
    res.json(results);
  } catch (err) {
    res.status(502).json({ error: "Search failed", detail: String(err) });
  }
});

router.get("/:symbol", async (req, res) => {
  try {
    const quote = await getQuote(req.params.symbol);
    res.json(quote);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch quote", detail: String(err) });
  }
});

export default router;
