import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketTime: string | null;
}

interface CacheEntry {
  quote: Quote;
  fetchedAt: number;
}

interface RawQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  regularMarketTime?: Date;
}

interface RawSearchQuote {
  symbol?: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, CacheEntry>();

function toQuote(raw: RawQuote): Quote {
  return {
    symbol: raw.symbol,
    name: raw.shortName ?? raw.longName ?? raw.symbol,
    price: raw.regularMarketPrice ?? 0,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
    currency: raw.currency ?? "USD",
    marketTime: raw.regularMarketTime
      ? new Date(raw.regularMarketTime).toISOString()
      : null,
  };
}

export async function getQuote(symbol: string): Promise<Quote> {
  const key = symbol.toUpperCase();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.quote;
  }

  const raw = (await yahooFinance.quote(key)) as unknown as RawQuote;
  const quote = toQuote(raw);
  cache.set(key, { quote, fetchedAt: Date.now() });
  return quote;
}

export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const uniqueSymbols = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const results = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        return await getQuote(symbol);
      } catch {
        return null;
      }
    })
  );
  return results.filter((q): q is Quote => q !== null);
}

export async function searchSymbol(query: string) {
  const result = (await yahooFinance.search(query)) as unknown as {
    quotes: RawSearchQuote[];
  };
  return result.quotes
    .filter((q): q is RawSearchQuote & { symbol: string } => !!q.symbol)
    .slice(0, 10)
    .map((q) => ({
      symbol: q.symbol,
      name: q.shortname ?? q.longname ?? q.symbol,
      exchange: q.exchange,
    }));
}
