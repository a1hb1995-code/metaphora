import axios from "axios";
import type {
  Transaction,
  Holding,
  Dividend,
  DividendSummary,
  PortfolioSummary,
  DailyStat,
  MonthlyStat,
} from "../types";

const api = axios.create({ baseURL: "/api" });

export interface NewTransaction {
  symbol: string;
  name?: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  fee: number;
  tradeDate: string;
  note?: string;
}

export interface NewDividend {
  symbol: string;
  amount: number;
  payDate: string;
  note?: string;
}

export const transactionsApi = {
  list: async (symbol?: string) => {
    const { data } = await api.get<Transaction[]>("/transactions", {
      params: symbol ? { symbol } : undefined,
    });
    return data;
  },
  create: async (payload: NewTransaction) => {
    const { data } = await api.post<Transaction>("/transactions", payload);
    return data;
  },
  update: async (id: number, payload: NewTransaction) => {
    const { data } = await api.put<Transaction>(`/transactions/${id}`, payload);
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/transactions/${id}`);
  },
};

export const holdingsApi = {
  list: async () => {
    const { data } = await api.get<Holding[]>("/holdings");
    return data;
  },
};

export const dividendsApi = {
  list: async (symbol?: string) => {
    const { data } = await api.get<Dividend[]>("/dividends", {
      params: symbol ? { symbol } : undefined,
    });
    return data;
  },
  summary: async () => {
    const { data } = await api.get<DividendSummary>("/dividends/summary");
    return data;
  },
  create: async (payload: NewDividend) => {
    const { data } = await api.post<Dividend>("/dividends", payload);
    return data;
  },
  remove: async (id: number) => {
    await api.delete(`/dividends/${id}`);
  },
};

export const portfolioApi = {
  summary: async () => {
    const { data } = await api.get<PortfolioSummary>("/portfolio/summary");
    return data;
  },
  daily: async (days: number) => {
    const { data } = await api.get<DailyStat[]>("/portfolio/stats/daily", {
      params: { days },
    });
    return data;
  },
  monthly: async (months: number) => {
    const { data } = await api.get<MonthlyStat[]>("/portfolio/stats/monthly", {
      params: { months },
    });
    return data;
  },
};

export const quotesApi = {
  search: async (q: string) => {
    const { data } = await api.get<
      { symbol: string; name?: string; exchange?: string }[]
    >("/quotes/search", { params: { q } });
    return data;
  },
};
