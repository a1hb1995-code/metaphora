import { useState } from "react";
import type { NewTransaction } from "../api/client";

interface TransactionFormProps {
  onSubmit: (payload: NewTransaction) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [fee, setFee] = useState("0");
  const [tradeDate, setTradeDate] = useState(today());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSymbol("");
    setName("");
    setQuantity("");
    setPrice("");
    setFee("0");
    setNote("");
    setTradeDate(today());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const qty = Number(quantity);
    const prc = Number(price);
    const feeVal = Number(fee || 0);

    if (!symbol.trim()) {
      setError("종목 코드를 입력하세요.");
      return;
    }
    if (!(qty > 0)) {
      setError("수량은 0보다 커야 합니다.");
      return;
    }
    if (!(prc >= 0)) {
      setError("가격을 확인하세요.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        symbol: symbol.trim(),
        name: name.trim() || undefined,
        type,
        quantity: qty,
        price: prc,
        fee: feeVal,
        tradeDate,
        note: note.trim() || undefined,
      });
      reset();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-field">
          <label>종목 코드</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
          />
        </div>
        <div className="form-field">
          <label>종목명 (선택)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Apple Inc." />
        </div>
        <div className="form-field form-field-sm">
          <label>구분</label>
          <select value={type} onChange={(e) => setType(e.target.value as "BUY" | "SELL")}>
            <option value="BUY">매수</option>
            <option value="SELL">매도</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-field">
          <label>수량</label>
          <input
            type="number"
            min="0"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>단가</label>
          <input
            type="number"
            min="0"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="form-field form-field-sm">
          <label>수수료</label>
          <input type="number" min="0" step="any" value={fee} onChange={(e) => setFee(e.target.value)} />
        </div>
        <div className="form-field">
          <label>거래일</label>
          <input type="date" value={tradeDate} onChange={(e) => setTradeDate(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-field form-field-grow">
          <label>메모 (선택)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="form-field form-field-action">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "저장 중..." : "거래 추가"}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
