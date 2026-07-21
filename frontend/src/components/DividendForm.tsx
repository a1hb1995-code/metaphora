import { useState } from "react";
import type { NewDividend } from "../api/client";

interface DividendFormProps {
  onSubmit: (payload: NewDividend) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function DividendForm({ onSubmit }: DividendFormProps) {
  const [symbol, setSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const [payDate, setPayDate] = useState(today());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!symbol.trim()) {
      setError("종목 코드를 입력하세요.");
      return;
    }
    if (!(amt >= 0)) {
      setError("금액을 확인하세요.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        symbol: symbol.trim(),
        amount: amt,
        payDate,
        note: note.trim() || undefined,
      });
      setSymbol("");
      setAmount("");
      setNote("");
      setPayDate(today());
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
          <label>배당금액</label>
          <input
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>지급일</label>
          <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
        </div>
        <div className="form-field form-field-grow">
          <label>메모 (선택)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="form-field form-field-action">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "저장 중..." : "배당 추가"}
          </button>
        </div>
      </div>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}
