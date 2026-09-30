#!/usr/bin/env bash
# 하네스 검증 게이트 — "완료"의 유일한 기준.
# 사용법: harness/check.sh [--scope all|backend|frontend] [--fast]
#   --fast : 프론트엔드 프로덕션 빌드(vite build) 생략
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCOPE="all"
FAST=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --scope) SCOPE="$2"; shift 2 ;;
    --fast) FAST=1; shift ;;
    *) echo "unknown arg: $1" >&2; exit 64 ;;
  esac
done

FAILED=()
PASSED=()

step() {
  local name="$1" dir="$2"; shift 2
  local start=$SECONDS out
  if out=$(cd "$ROOT/$dir" && "$@" 2>&1); then
    PASSED+=("$name ($((SECONDS - start))s)")
    echo "✔ $name"
  else
    FAILED+=("$name")
    echo "✘ $name"
    echo "$out" | tail -n 40 | sed 's/^/    /'
  fi
}

ensure_deps() {
  [[ -d "$ROOT/$1/node_modules" ]] || (cd "$ROOT/$1" && npm ci --no-audit --no-fund >/dev/null 2>&1)
}

if [[ "$SCOPE" == "all" || "$SCOPE" == "backend" ]]; then
  ensure_deps backend
  step "backend:typecheck" backend npm run --silent typecheck
  step "backend:test"      backend npm run --silent test
fi

if [[ "$SCOPE" == "all" || "$SCOPE" == "frontend" ]]; then
  ensure_deps frontend
  step "frontend:typecheck" frontend npx tsc -b
  step "frontend:lint"      frontend npx oxlint --deny-warnings
  if [[ $FAST -eq 0 ]]; then
    step "frontend:build"   frontend npx vite build --logLevel error
  fi
fi

echo
if [[ ${#FAILED[@]} -gt 0 ]]; then
  echo "HARNESS: FAIL — ${FAILED[*]}"
  exit 1
fi
echo "HARNESS: PASS — ${PASSED[*]}"
