# metaphora — 에이전트 작업 가이드

주식 포트폴리오 관리 풀스택 앱. 이 레포는 **하네스 엔지니어링** 구조로 운영된다:
에이전트는 아래 규칙·도구·검증 게이트 안에서 일하고, "완료"는 사람이 아니라 게이트가 판정한다.
하네스 전체 구조는 `harness/README.md` 참고.

## 구조
- `backend/` — Express + TypeScript + `node:sqlite`. 라우트 `src/routes/*`, 비즈니스 로직 `src/services/*`, 스키마 `src/db/index.ts`
- `frontend/` — React 19 + Vite + Recharts. API 호출 `src/api/client.ts`, 타입 `src/types/index.ts`, 화면 `src/pages/*`
- `harness/` — 검증 게이트·스모크 테스트·진행 로그
- `.claude/` — 훅(자동 강제), 서브에이전트, 스킬

## 명령
| 목적 | 명령 |
| --- | --- |
| 전체 검증 게이트 | `harness/check.sh` (`--scope backend\|frontend`, `--fast`) |
| API 스모크 테스트 | `harness/smoke.sh` (임시 DB로 서버 기동 후 실제 호출) |
| 백엔드 단위 테스트 | `cd backend && npm test` |

## 완료의 정의 (Definition of Done)
1. `harness/check.sh`가 PASS — Stop 훅이 코드 변경 시 자동으로 실행하며, 실패하면 종료가 막힌다.
2. API를 건드렸다면 `harness/smoke.sh` PASS, 새 엔드포인트는 스모크에 케이스 추가.
3. 순수 로직(`services/`)을 바꿨다면 `backend/test/`에 테스트 추가/수정.
4. 여러 단계에 걸친 작업이면 `harness/progress.md`에 한 줄 기록.

## 코드 규칙
- 백엔드 입력 검증은 항상 zod `safeParse` → 400 `{ error: parsed.error.flatten() }`.
- API는 camelCase로 받고(`tradeDate`), DB 컬럼은 snake_case(`trade_date`).
- 새 엔드포인트 = 라우트 + `frontend/src/api/client.ts` 함수 + `frontend/src/types` 타입 + README API 표 갱신.
- 외부 시세(`yahoo-finance2`)는 실패할 수 있다. 실패 시 평균 단가로 대체하는 기존 폴백을 유지하고, 테스트는 네트워크에 의존하지 않는다.
- 테스트/스크립트는 `DB_PATH`로 임시 DB를 쓴다. `backend/data/`는 건드리지 않는다.

## 가드레일 (훅이 자동 차단)
- 편집 금지: `.env*`, `package-lock.json`(npm으로만), `backend/data/`, `dist/`, `node_modules/`
- 명령 금지: force push(`--force-with-lease`는 허용), 하드 리셋, `git clean -f`, `--no-verify`, 프로젝트/홈 재귀 삭제
- 차단되면 우회하지 말고 더 안전한 방법을 찾거나 사용자에게 묻는다.

## 워크플로 도구
- 스킬 `/feature` — 계획 → 구현 → 검증 → 리뷰 루프
- 스킬 `/verify` — 게이트 + 스모크 + 결과 보고
- 스킬 `/api-endpoint` — 엔드포인트 추가 체크리스트
- 서브에이전트 `reviewer` — 변경분을 독립적으로 비판 검토 (읽기 전용)
- 서브에이전트 `test-writer` — 서비스 로직에 대한 단위 테스트 작성
