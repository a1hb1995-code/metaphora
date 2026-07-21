import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export interface DailyClose {
  date: string; // YYYY-MM-DD
  close: number;
}

interface CacheEntry {
  closes: DailyClose[];
  fetchedAt: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry>();

interface RawChartQuote {
  date: Date;
  close: number | null;
}

interface RawChartResult {
  quotes: RawChartQuote[];
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getHistoricalCloses(
  symbol: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<DailyClose[]> {
  const cacheKey = `${symbol}:${toDateKey(startDate)}:${toDateKey(endDate)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.closes;
  }

  const result = (await yahooFinance.chart(symbol, {
    period1: startDate,
    period2: endDate,
    interval: "1d",
  })) as unknown as RawChartResult;

  const closes: DailyClose[] = result.quotes
    .filter((q) => q.close !== null && q.close !== undefined)
    .map((q) => ({
      date: toDateKey(new Date(q.date)),
      close: q.close as number,
    }));

  cache.set(cacheKey, { closes, fetchedAt: Date.now() });
  return closes;
}

export async function getHistoricalClosesForSymbols(
  symbols: string[],
  startDate: Date,
  endDate: Date = new Date()
): Promise<Map<string, Map<string, number>>> {
  const uniqueSymbols = [...new Set(symbols)];
  const map = new Map<string, Map<string, number>>();

  await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        const closes = await getHistoricalCloses(symbol, startDate, endDate);
        const bySymbol = new Map<string, number>();
        for (const c of closes) {
          bySymbol.set(c.date, c.close);
        }
        map.set(symbol, bySymbol);
      } catch {
        map.set(symbol, new Map());
      }
    })
  );

  return map;
}
