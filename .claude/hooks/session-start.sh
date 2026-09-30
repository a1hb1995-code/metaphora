#!/usr/bin/env bash
# SessionStart: 의존성을 준비하고 하네스 상태/진행 로그를 컨텍스트로 주입한다.
set -uo pipefail
ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"

for pkg in backend frontend; do
  if [[ ! -d "$ROOT/$pkg/node_modules" ]]; then
    (cd "$ROOT/$pkg" && npm ci --no-audit --no-fund >/dev/null 2>&1) || echo "[harness] $pkg npm ci 실패"
  fi
done

rm -f "$ROOT/.claude/.harness-state/state.json"

echo "[harness] 세션 시작. 완료 기준: harness/check.sh 통과 (Stop 훅이 자동 강제)."
echo "[harness] 최근 커밋:"
git -C "$ROOT" log --oneline -5 2>/dev/null | sed 's/^/  /'
if [[ -f "$ROOT/harness/progress.md" ]]; then
  echo "[harness] harness/progress.md (최근 항목):"
  tail -n 20 "$ROOT/harness/progress.md" | sed 's/^/  /'
fi
