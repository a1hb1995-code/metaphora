import { useCallback, useEffect, useState } from "react";
import { dividendsApi, type NewDividend } from "../api/client";
import DividendForm from "../components/DividendForm";
import DividendTable from "../components/DividendTable";
import DividendChart from "../components/DividendChart";
import StatCard from "../components/StatCard";
import type { Dividend, DividendSummary } from "../types";
import { formatCurrency } from "../utils/format";

export default function Dividends() {
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [summary, setSummary] = useState<DividendSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, s] = await Promise.all([dividendsApi.list(), dividendsApi.summary()]);
      setDividends(list);
      setSummary(s);
    } catch {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload: NewDividend) => {
    await dividendsApi.create(payload);
    await load();
  };

  const handleDelete = async (id: number) => {
    await dividendsApi.remove(id);
    await load();
  };

  return (
    <div className="page">
      <h1 className="page-title">배당금 관리</h1>

      {summary && (
        <div className="stat-grid">
          <StatCard label="누적 배당금" value={formatCurrency(summary.total)} />
          {summary.byYear[0] && (
            <StatCard
              label={`${summary.byYear[0].year}년 배당금`}
              value={formatCurrency(summary.byYear[0].total)}
            />
          )}
          <StatCard
            label="배당 종목 수"
            value={String(summary.bySymbol.length)}
          />
        </div>
      )}

      <section className="card">
        <div className="card-header">
          <h2>월별 배당금 추이</h2>
        </div>
        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : (
          <DividendChart data={summary?.byMonth ?? []} />
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>배당 기록 추가</h2>
        </div>
        <DividendForm onSubmit={handleCreate} />
      </section>

      <section className="card">
        <div className="card-header">
          <h2>배당 내역</h2>
        </div>
        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <DividendTable dividends={dividends} onDelete={handleDelete} />
        )}
      </section>
    </div>
  );
}
