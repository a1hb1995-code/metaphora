import { Router } from "express";
import { db } from "../db/index.js";
import { getHoldings, getRealizedPnlAll } from "../services/holdingsService.js";
import { computeDailyStats, computeMonthlyStats } from "../services/portfolioStatsService.js";

const router = Router();

router.get("/summary", async (_req, res) => {
  try {
    const holdings = await getHoldings();
    const realized = getRealizedPnlAll();
    const totalRealizedPnl = realized.reduce((sum, r) => sum + r.realizedPnl, 0);
    const dividendTotal = db
      .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM dividends")
      .get() as { total: number };

    const totalMarketValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    const totalCostBasis = holdings.reduce((sum, h) => sum + h.avgCost * h.quantity, 0);
    const totalUnrealizedPnl = totalMarketValue - totalCostBasis;

    const allocation = holdings
      .map((h) => ({
        symbol: h.symbol,
        name: h.name,
        marketValue: h.marketValue,
        weight: totalMarketValue > 0 ? h.marketValue / totalMarketValue : 0,
      }))
      .sort((a, b) => b.marketValue - a.marketValue);

    res.json({
      totalMarketValue,
      totalCostBasis,
      totalUnrealizedPnl,
      totalUnrealizedPnlPercent:
        totalCostBasis > 0 ? (totalUnrealizedPnl / totalCostBasis) * 100 : 0,
      totalRealizedPnl,
      totalDividends: dividendTotal.total,
      holdingsCount: holdings.length,
      allocation,
    });
  } catch (err) {
    res.status(502).json({ error: "Failed to compute summary", detail: String(err) });
  }
});

router.get("/stats/daily", async (req, res) => {
  const days = Number(req.query.days ?? 30);
  try {
    const stats = await computeDailyStats(Number.isFinite(days) && days > 0 ? days : 30);
    res.json(stats);
  } catch (err) {
    res.status(502).json({ error: "Failed to compute daily stats", detail: String(err) });
  }
});

router.get("/stats/monthly", async (req, res) => {
  const months = Number(req.query.months ?? 12);
  try {
    const stats = await computeMonthlyStats(
      Number.isFinite(months) && months > 0 ? months : 12
    );
    res.json(stats);
  } catch (err) {
    res.status(502).json({ error: "Failed to compute monthly stats", detail: String(err) });
  }
});

export default router;
