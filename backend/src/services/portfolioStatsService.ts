import { db } from "../db/index.js";
import type { TransactionRow } from "./holdingsService.js";
import { getHistoricalClosesForSymbols } from "./historyService.js";

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function getAllTransactionsSorted(): TransactionRow[] {
  const rows = db
    .prepare("SELECT * FROM transactions ORDER BY trade_date ASC, id ASC")
    .all() as unknown as TransactionRow[];
  return rows;
}

function getDividendsByDate(): Map<string, number> {
  const rows = db
    .prepare("SELECT pay_date, SUM(amount) AS total FROM dividends GROUP BY pay_date")
    .all() as { pay_date: string; total: number }[];
  return new Map(rows.map((r) => [r.pay_date, r.total]));
}

export interface DailyStat {
  date: string;
  portfolioValue: number;
  netInvested: number;
  totalPnl: number;
  dailyPnl: number;
  dividend: number;
}

export interface MonthlyStat {
  month: string; // YYYY-MM
  portfolioValue: number;
  netInvested: number;
  totalPnl: number;
  monthlyPnl: number;
  dividend: number;
}

export async function computeDailyStats(days: number): Promise<DailyStat[]> {
  const transactions = getAllTransactionsSorted();
  if (transactions.length === 0) return [];

  const earliest = new Date(transactions[0].trade_date);
  const today = new Date(toDateKey(new Date()));
  const requestedStart = addDays(today, -days + 1);
  const start = earliest > requestedStart ? earliest : requestedStart;

  const symbols = [...new Set(transactions.map((t) => t.symbol))];
  const closesBySymbol = await getHistoricalClosesForSymbols(symbols, start, today);
  const dividendsByDate = getDividendsByDate();

  const qty = new Map<string, number>();
  const lastKnownPrice = new Map<string, number>();
  let netInvested = 0;
  let txIndex = 0;
  let prevTotalPnl = 0;

  const results: DailyStat[] = [];
  let cursor = new Date(start);

  while (cursor.getTime() <= today.getTime()) {
    const dateKey = toDateKey(cursor);

    while (
      txIndex < transactions.length &&
      transactions[txIndex].trade_date <= dateKey
    ) {
      const tx = transactions[txIndex];
      const currentQty = qty.get(tx.symbol) ?? 0;
      if (tx.type === "BUY") {
        qty.set(tx.symbol, currentQty + tx.quantity);
        netInvested += tx.quantity * tx.price + tx.fee;
      } else {
        qty.set(tx.symbol, currentQty - tx.quantity);
        netInvested -= tx.quantity * tx.price - tx.fee;
      }
      txIndex++;
    }

    let portfolioValue = 0;
    for (const [symbol, heldQty] of qty.entries()) {
      if (heldQty <= 0) continue;
      const closeMap = closesBySymbol.get(symbol);
      const closeToday = closeMap?.get(dateKey);
      if (closeToday !== undefined) {
        lastKnownPrice.set(symbol, closeToday);
      }
      const price = lastKnownPrice.get(symbol);
      portfolioValue += heldQty * (price ?? 0);
    }

    const totalPnl = portfolioValue - netInvested;
    const dailyPnl = results.length === 0 ? 0 : totalPnl - prevTotalPnl;
    prevTotalPnl = totalPnl;

    results.push({
      date: dateKey,
      portfolioValue,
      netInvested,
      totalPnl,
      dailyPnl,
      dividend: dividendsByDate.get(dateKey) ?? 0,
    });

    cursor = addDays(cursor, 1);
  }

  return results;
}

export async function computeMonthlyStats(months: number): Promise<MonthlyStat[]> {
  const days = months * 31;
  const daily = await computeDailyStats(days);
  if (daily.length === 0) return [];

  const byMonth = new Map<string, DailyStat[]>();
  for (const d of daily) {
    const month = d.date.slice(0, 7);
    const arr = byMonth.get(month) ?? [];
    arr.push(d);
    byMonth.set(month, arr);
  }

  const sortedMonths = [...byMonth.keys()].sort();
  const results: MonthlyStat[] = [];
  let prevPnl = 0;

  for (const month of sortedMonths) {
    const entries = byMonth.get(month)!;
    const last = entries[entries.length - 1];
    const dividend = entries.reduce((sum, e) => sum + e.dividend, 0);
    const monthlyPnl = last.totalPnl - prevPnl;
    prevPnl = last.totalPnl;

    results.push({
      month,
      portfolioValue: last.portfolioValue,
      netInvested: last.netInvested,
      totalPnl: last.totalPnl,
      monthlyPnl,
      dividend,
    });
  }

  return results.slice(-months);
}
