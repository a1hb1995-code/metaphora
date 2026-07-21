export type TransactionType = "BUY" | "SELL";

export interface Transaction {
  id: number;
  symbol: string;
  name: string | null;
  type: TransactionType;
  quantity: number;
  price: number;
  fee: number;
  trade_date: string;
  note: string | null;
  created_at: string;
}

export interface Holding {
  symbol: string;
  name: string | null;
  quantity: number;
  avgCost: number;
  realizedPnl: number;
  totalBought: number;
  totalSold: number;
  currentPrice: number;
  currency: string;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  changePercent: number;
}

export interface Dividend {
  id: number;
  symbol: string;
  amount: number;
  pay_date: string;
  note: string | null;
  created_at: string;
}

export interface DividendSummary {
  total: number;
  byYear: { year: string; total: number }[];
  byMonth: { month: string; total: number }[];
  bySymbol: { symbol: string; total: number }[];
}

export interface PortfolioSummary {
  totalMarketValue: number;
  totalCostBasis: number;
  totalUnrealizedPnl: number;
  totalUnrealizedPnlPercent: number;
  totalRealizedPnl: number;
  totalDividends: number;
  holdingsCount: number;
  allocation: {
    symbol: string;
    name: string | null;
    marketValue: number;
    weight: number;
  }[];
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
  month: string;
  portfolioValue: number;
  netInvested: number;
  totalPnl: number;
  monthlyPnl: number;
  dividend: number;
}
