import { Router } from "express";
import { getHoldings } from "../services/holdingsService.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const holdings = await getHoldings();
    res.json(holdings);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch market data", detail: String(err) });
  }
});

export default router;
