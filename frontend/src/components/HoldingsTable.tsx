import type { Holding } from "../types";
import { formatCurrency, formatNumber, formatPercent, pnlClass } from "../utils/format";

export default function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return <div className="empty-state">보유 중인 종목이 없습니다</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>종목</th>
            <th>수량</th>
            <th>평균단가</th>
            <th>현재가</th>
            <th>평가금액</th>
            <th>평가손익</th>
            <th>수익률</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.symbol}>
              <td>
                <div className="cell-symbol">{h.symbol}</div>
                {h.name && <div className="cell-sub">{h.name}</div>}
              </td>
              <td>{formatNumber(h.quantity)}</td>
              <td>{formatCurrency(h.avgCost, h.currency)}</td>
              <td>{formatCurrency(h.currentPrice, h.currency)}</td>
              <td>{formatCurrency(h.marketValue, h.currency)}</td>
              <td className={pnlClass(h.unrealizedPnl)}>
                {formatCurrency(h.unrealizedPnl, h.currency)}
              </td>
              <td className={pnlClass(h.unrealizedPnlPercent)}>
                {formatPercent(h.unrealizedPnlPercent)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
