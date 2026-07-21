import type { Dividend } from "../types";
import { formatCurrency } from "../utils/format";

interface DividendTableProps {
  dividends: Dividend[];
  onDelete: (id: number) => void;
}

export default function DividendTable({ dividends, onDelete }: DividendTableProps) {
  if (dividends.length === 0) {
    return <div className="empty-state">배당 기록이 없습니다</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>지급일</th>
            <th>종목</th>
            <th>금액</th>
            <th>메모</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dividends.map((d) => (
            <tr key={d.id}>
              <td>{d.pay_date}</td>
              <td>
                <div className="cell-symbol">{d.symbol}</div>
              </td>
              <td>{formatCurrency(d.amount)}</td>
              <td>{d.note ?? "-"}</td>
              <td>
                <button className="btn-icon" onClick={() => onDelete(d.id)} title="삭제">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
