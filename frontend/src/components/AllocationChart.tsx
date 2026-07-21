import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../utils/format";

interface AllocationItem {
  symbol: string;
  marketValue: number;
  weight: number;
}

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
  "#84cc16",
  "#14b8a6",
  "#f97316",
];

export default function AllocationChart({ data }: { data: AllocationItem[] }) {
  if (data.length === 0) {
    return <div className="empty-state">보유 종목이 없습니다</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="marketValue"
          nameKey="symbol"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.symbol} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, item) => [
            formatCurrency(Number(value)),
            item.payload.symbol,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
