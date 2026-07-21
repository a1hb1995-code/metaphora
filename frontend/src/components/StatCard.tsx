interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  subClass?: string;
}

export default function StatCard({ label, value, subValue, subClass }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {subValue && <div className={`stat-sub ${subClass ?? ""}`}>{subValue}</div>}
    </div>
  );
}
