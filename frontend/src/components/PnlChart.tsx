import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../utils/format";

interface PnlChartProps {
  data: { label: string; totalPnl: number }[];
}

export default function PnlChart({ data }: PnlChartProps) {
  if (data.length === 0) {
    return <div className="empty-state">데이터가 없습니다</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} minTickGap={20} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(v) => formatCurrency(v).replace(/\.00$/, "")}
          width={90}
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
        <Area
          type="monotone"
          dataKey="totalPnl"
          stroke="#6366f1"
          fill="url(#pnlGradient)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
