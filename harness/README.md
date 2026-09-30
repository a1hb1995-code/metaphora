# 하네스 (Harness)

에이전트가 이 레포에서 **안전하게, 검증 가능하게** 일하도록 만드는 장치 모음.

```
          ┌──────────── 지식 ────────────┐
          │ CLAUDE.md · skills · agents  │   무엇을/어떻게 할지 알려준다
          └──────────────┬───────────────┘
 SessionStart ──▶ 의존성 설치 + 최근 커밋/progress.md 주입
          │
 PreToolUse  ──▶ guard-bash / protect-files     위험한 행동을 막는다
          │
 PostToolUse ──▶ track-edits (dirty 기록 + oxlint 즉시 피드백)
          │
 Stop        ──▶ stop-gate → harness/check.sh    통과 전엔 "끝" 못 낸다
```

| 계층 | 파일 | 역할 |
| --- | --- | --- |
| 지식 | `CLAUDE.md` | 구조, 명령, 완료의 정의, 코드 규칙 |
| 워크플로 | `.claude/skills/{feature,verify,api-endpoint}` | 반복 작업 절차 |
| 역할 분리 | `.claude/agents/{reviewer,test-writer}` | 독립 검토 / 테스트 작성 |
| 가드레일 | `.claude/hooks/guard-bash.mjs`, `protect-files.mjs` | 파괴적 명령·보호 파일 차단 |
| 피드백 | `.claude/hooks/track-edits.mjs` | 편집 즉시 lint, 변경 패키지 추적 |
| 검증 게이트 | `harness/check.sh` ← `.claude/hooks/stop-gate.mjs` | typecheck·test·lint·build |
| 실동작 확인 | `harness/smoke.sh` | 임시 DB로 서버 띄워 API 호출 |
| 기억 | `harness/progress.md` | 세션 간 진행 상황 |

## 동작 방식
- 코드를 편집하면 `track-edits`가 해당 패키지(backend/frontend)를 dirty로 표시한다. 프론트 파일은 그 자리에서 oxlint를 돌려 경고를 즉시 돌려준다.
- 에이전트가 작업을 끝내려 하면 `stop-gate`가 dirty 패키지에 대해 `check.sh --fast`를 실행한다. 실패하면 오류를 붙여 종료를 막고, 에이전트는 고친 뒤 다시 시도한다. 무한 루프 방지를 위해 연속 3회까지만 막는다.
- 가드 훅은 명령 위치의 위험 명령만 본다(heredoc 본문, echo 문자열은 무시). 셸 따옴표까지 해석하진 않으므로 완벽한 샌드박스가 아니라 실수 방지 장치다.

## 확장하기
- **새 규칙을 강제하고 싶다** → CLAUDE.md에 말로 쓰기보다 훅이나 `check.sh` 단계로 만든다. 기계가 확인하는 규칙이 가장 잘 지켜진다.
- **에이전트가 같은 실수를 반복한다** → 그 실수를 잡는 테스트/스모크 케이스를 추가한다.
- **새 반복 작업** → `.claude/skills/<이름>/SKILL.md`.
- 상태 파일은 `.claude/.harness-state/`(gitignore)에 있다. 꼬이면 지워도 된다.
