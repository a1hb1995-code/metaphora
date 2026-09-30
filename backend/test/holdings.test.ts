import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeHoldingsFromTransactions,
  type TransactionRow,
} from "../src/services/holdingsService.js";

let nextId = 1;
function tx(partial: Partial<TransactionRow> & Pick<TransactionRow, "type" | "quantity" | "price">): TransactionRow {
  return {
    id: nextId++,
    symbol: "AAPL",
    name: null,
    fee: 0,
    trade_date: "2024-01-01",
    note: null,
    created_at: "2024-01-01 00:00:00",
    ...partial,
  };
}

test("BUY 두 번이면 수수료를 포함한 가중 평균 단가를 계산한다", () => {
  const [h] = computeHoldingsFromTransactions([
    tx({ type: "BUY", quantity: 10, price: 100, fee: 10 }),
    tx({ type: "BUY", quantity: 10, price: 200, trade_date: "2024-01-02" }),
  ]);
  assert.equal(h.quantity, 20);
  assert.equal(h.avgCost, (1000 + 10 + 2000) / 20);
  assert.equal(h.totalBought, 3000);
});

test("SELL은 평균 단가 기준으로 실현 손익을 계산하고 수수료를 차감한다", () => {
  const [h] = computeHoldingsFromTransactions([
    tx({ type: "BUY", quantity: 10, price: 100 }),
    tx({ type: "SELL", quantity: 4, price: 150, fee: 5, trade_date: "2024-02-01" }),
  ]);
  assert.equal(h.quantity, 6);
  assert.equal(h.avgCost, 100);
  assert.equal(h.realizedPnl, 4 * 50 - 5);
});

test("전량 매도하면 수량과 평균 단가가 0으로 초기화된다", () => {
  const [h] = computeHoldingsFromTransactions([
    tx({ type: "BUY", quantity: 5, price: 100 }),
    tx({ type: "SELL", quantity: 5, price: 120, trade_date: "2024-02-01" }),
  ]);
  assert.equal(h.quantity, 0);
  assert.equal(h.avgCost, 0);
  assert.equal(h.realizedPnl, 100);
});

test("입력 순서와 무관하게 거래일 순으로 처리한다", () => {
  const [h] = computeHoldingsFromTransactions([
    tx({ type: "SELL", quantity: 5, price: 120, trade_date: "2024-02-01" }),
    tx({ type: "BUY", quantity: 10, price: 100, trade_date: "2024-01-01" }),
  ]);
  assert.equal(h.quantity, 5);
  assert.equal(h.realizedPnl, 100);
});

test("종목별로 분리해서 집계한다", () => {
  const holdings = computeHoldingsFromTransactions([
    tx({ type: "BUY", quantity: 1, price: 10, symbol: "AAPL" }),
    tx({ type: "BUY", quantity: 2, price: 20, symbol: "MSFT" }),
  ]);
  assert.deepEqual(
    holdings.map((h) => [h.symbol, h.quantity]).sort(),
    [["AAPL", 1], ["MSFT", 2]]
  );
});
