import { db } from "../db/index.js";
import { getQuotes, type Quote } from "./quoteService.js";

export interface TransactionRow {
  id: number;
  symbol: string;
  name: string | null;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  trade_date: string;
  note: string | null;
  created_at: string;
}

interface HoldingAccumulator {
  symbol: string;
  name: string | null;
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  totalBought: number;
  totalSold: number;
}

export function computeHoldingsFromTransactions(
  transactions: TransactionRow[]
): HoldingAccumulator[] {
  const bySymbol = new Map<string, HoldingAccumulator>();

  const sorted = [...transactions].sort((a, b) => {
    if (a.trade_date !== b.trade_date) {
      return a.trade_date.localeCompare(b.trade_date);
    }
    return a.id - b.id;
  });

  for (const tx of sorted) {
    let acc = bySymbol.get(tx.symbol);
    if (!acc) {
      acc = {
        symbol: tx.symbol,
        name: tx.name,
        quantity: 0,
        avgCost: 0,
        realizedPnl: 0,
        totalBought: 0,
        totalSold: 0,
      };
      bySymbol.set(tx.symbol, acc);
    }
    if (tx.name) acc.name = tx.name;

    if (tx.type === "BUY") {
      const totalCost = acc.quantity * acc.avgCost + tx.quantity * tx.price + tx.fee;
      acc.quantity += tx.quantity;
      acc.avgCost = acc.quantity > 0 ? totalCost / acc.quantity : 0;
      acc.totalBought += tx.quantity * tx.price;
    } else {
      const sellQty = Math.min(tx.quantity, acc.quantity);
      acc.realizedPnl += (tx.price - acc.avgCost) * sellQty - tx.fee;
      acc.quantity -= sellQty;
      acc.totalSold += tx.quantity * tx.price;
      if (acc.quantity <= 0) {
        acc.quantity = 0;
        acc.avgCost = 0;
      }
    }
  }

  return [...bySymbol.values()];
}

export interface HoldingWithMarketData extends HoldingAccumulator {
  currentPrice: number;
  currency: string;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  changePercent: number;
}

function getAllTransactions(): TransactionRow[] {
  return db.prepare("SELECT * FROM transactions").all() as unknown as TransactionRow[];
}

export async function getHoldings(): Promise<HoldingWithMarketData[]> {
  const transactions = getAllTransactions();
  const holdings = computeHoldingsFromTransactions(transactions).filter(
    (h) => h.quantity > 0
  );

  const quotes = await getQuotes(holdings.map((h) => h.symbol));
  const quoteMap = new Map<string, Quote>(quotes.map((q) => [q.symbol, q]));

  return holdings.map((h) => {
    const quote = quoteMap.get(h.symbol);
    const currentPrice = quote?.price ?? h.avgCost;
    const marketValue = currentPrice * h.quantity;
    const costBasis = h.avgCost * h.quantity;
    const unrealizedPnl = marketValue - costBasis;
    return {
      ...h,
      currentPrice,
      currency: quote?.currency ?? "USD",
      marketValue,
      unrealizedPnl,
      unrealizedPnlPercent: costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0,
      changePercent: quote?.changePercent ?? 0,
    };
  });
}

export function getRealizedPnlAll(): { symbol: string; realizedPnl: number }[] {
  const transactions = getAllTransactions();
  const holdings = computeHoldingsFromTransactions(transactions);
  return holdings.map((h) => ({ symbol: h.symbol, realizedPnl: h.realizedPnl }));
}
