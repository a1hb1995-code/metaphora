#!/usr/bin/env bash
# 엔드투엔드 스모크 테스트: 임시 DB로 백엔드를 띄우고 핵심 API 흐름을 실제로 호출한다.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SMOKE_PORT:-4599}"
TMP="$(mktemp -d)"
BASE="http://localhost:$PORT/api"
LOG="$TMP/server.log"

cleanup() { [[ -n "${PID:-}" ]] && kill "$PID" 2>/dev/null || true; rm -rf "$TMP"; }
trap cleanup EXIT

cd "$ROOT/backend"
[[ -d node_modules ]] || npm ci --no-audit --no-fund >/dev/null
PORT=$PORT DB_PATH="$TMP/smoke.db" npx tsx src/index.ts >"$LOG" 2>&1 &
PID=$!

for _ in $(seq 1 50); do
  curl -fsS "$BASE/health" >/dev/null 2>&1 && break
  sleep 0.2
done
curl -fsS "$BASE/health" >/dev/null || { echo "✘ server did not start"; cat "$LOG"; exit 1; }

fail() { echo "✘ $1"; echo "--- server log ---"; tail -n 30 "$LOG"; exit 1; }
expect() { # expect <desc> <expected-status> <method> <path> [json-body]
  local desc="$1" want="$2" method="$3" path="$4" body="${5:-}"
  local args=(-s -o "$TMP/body" -w '%{http_code}' -X "$method" "$BASE$path")
  [[ -n "$body" ]] && args+=(-H 'Content-Type: application/json' -d "$body")
  local got; got=$(curl "${args[@]}")
  [[ "$got" == "$want" ]] || fail "$desc: expected $want, got $got ($(cat "$TMP/body"))"
  echo "✔ $desc"
}

expect "health"                 200 GET  /health
expect "create BUY"             201 POST /transactions '{"symbol":"smk","type":"BUY","quantity":10,"price":100,"fee":0,"tradeDate":"2024-01-02"}'
TX_ID=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).id)' "$TMP/body")
expect "reject invalid tx"      400 POST /transactions '{"symbol":"","type":"HOLD","quantity":-1}'
expect "list transactions"      200 GET  /transactions
expect "create dividend"        201 POST /dividends '{"symbol":"SMK","amount":12.5,"payDate":"2024-03-01"}'
expect "dividend summary"       200 GET  /dividends/summary
expect "delete transaction"     204 DELETE "/transactions/$TX_ID"
expect "unknown route is 404"   404 GET  /nope

echo "SMOKE: PASS"
