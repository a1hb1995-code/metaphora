import { useCallback, useEffect, useState } from "react";
import { holdingsApi, transactionsApi, type NewTransaction } from "../api/client";
import HoldingsTable from "../components/HoldingsTable";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import type { Holding, Transaction } from "../types";

export default function Holdings() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [h, t] = await Promise.all([holdingsApi.list(), transactionsApi.list()]);
      setHoldings(h);
      setTransactions(t);
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload: NewTransaction) => {
    await transactionsApi.create(payload);
    await load();
  };

  const handleDelete = async (id: number) => {
    await transactionsApi.remove(id);
    await load();
  };

  return (
    <div className="page">
      <h1 className="page-title">보유 종목 관리</h1>

      <section className="card">
        <div className="card-header">
          <h2>보유 종목</h2>
        </div>
        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <HoldingsTable holdings={holdings} />
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>매수/매도 기록 추가</h2>
        </div>
        <TransactionForm onSubmit={handleCreate} />
      </section>

      <section className="card">
        <div className="card-header">
          <h2>거래 내역</h2>
        </div>
        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : (
          <TransactionTable transactions={transactions} onDelete={handleDelete} />
        )}
      </section>
    </div>
  );
}
