import { useEffect, useMemo, useState } from "react";
import { portfolioApi } from "../api/client";
import StatCard from "../components/StatCard";
import AllocationChart from "../components/AllocationChart";
import PnlChart from "../components/PnlChart";
import type { DailyStat, MonthlyStat, PortfolioSummary } from "../types";
import { formatCurrency, formatPercent, pnlClass } from "../utils/format";

type Range = "daily" | "monthly";

export default function Dashboard() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [range, setRange] = useState<Range>("daily");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, d, m] = await Promise.all([
          portfolioApi.summary(),
          portfolioApi.daily(30),
          portfolioApi.monthly(12),
        ]);
        if (!cancelled) {
          setSummary(s);
          setDaily(d);
          setMonthly(m);
        }
      } catch {
        if (!cancelled) setError("데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => {
    if (range === "daily") {
      return daily.map((d) => ({ label: d.date.slice(5), totalPnl: d.totalPnl }));
    }
    return monthly.map((m) => ({ label: m.month, totalPnl: m.totalPnl }));
  }, [range, daily, monthly]);

  if (loading) return <div className="loading">불러오는 중...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!summary) return null;

  return (
    <div className="page">
      <h1 className="page-title">대시보드</h1>

      <div className="stat-grid">
        <StatCard
          label="총 평가금액"
          value={formatCurrency(summary.totalMarketValue)}
        />
        <StatCard
          label="평가손익"
          value={formatCurrency(summary.totalUnrealizedPnl)}
          subValue={formatPercent(summary.totalUnrealizedPnlPercent)}
          subClass={pnlClass(summary.totalUnrealizedPnl)}
        />
        <StatCard
          label="실현손익"
          value={formatCurrency(summary.totalRealizedPnl)}
          subClass={pnlClass(summary.totalRealizedPnl)}
        />
        <StatCard label="누적 배당금" value={formatCurrency(summary.totalDividends)} />
      </div>

      <div className="card-grid">
        <section className="card">
          <div className="card-header">
            <h2>손익 추이</h2>
            <div className="segmented">
              <button
                className={range === "daily" ? "segmented-active" : ""}
                onClick={() => setRange("daily")}
              >
                일별
              </button>
              <button
                className={range === "monthly" ? "segmented-active" : ""}
                onClick={() => setRange("monthly")}
              >
                월별
              </button>
            </div>
          </div>
          <PnlChart data={chartData} />
        </section>

        <section className="card">
          <div className="card-header">
            <h2>종목 비중</h2>
          </div>
          <AllocationChart data={summary.allocation} />
        </section>
      </div>
    </div>
  );
}
