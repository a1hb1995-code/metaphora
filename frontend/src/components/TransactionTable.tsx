import type { Transaction } from "../types";
import { formatCurrency, formatNumber } from "../utils/format";

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export default function TransactionTable({ transactions, onDelete }: TransactionTableProps) {
  if (transactions.length === 0) {
    return <div className="empty-state">거래 내역이 없습니다</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>종목</th>
            <th>구분</th>
            <th>수량</th>
            <th>단가</th>
            <th>수수료</th>
            <th>합계</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.trade_date}</td>
              <td>
                <div className="cell-symbol">{tx.symbol}</div>
                {tx.name && <div className="cell-sub">{tx.name}</div>}
              </td>
              <td>
                <span className={`badge ${tx.type === "BUY" ? "badge-buy" : "badge-sell"}`}>
                  {tx.type === "BUY" ? "매수" : "매도"}
                </span>
              </td>
              <td>{formatNumber(tx.quantity)}</td>
              <td>{formatCurrency(tx.price)}</td>
              <td>{formatCurrency(tx.fee)}</td>
              <td>{formatCurrency(tx.quantity * tx.price)}</td>
              <td>
                <button className="btn-icon" onClick={() => onDelete(tx.id)} title="삭제">
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
