---
name: api-endpoint
description: 백엔드 API 엔드포인트를 추가하거나 변경할 때의 체크리스트. 새 라우트, 요청/응답 형식 변경 시 사용.
---

엔드포인트 하나는 아래 **전부**가 함께 바뀌어야 완료다.

- [ ] `backend/src/routes/<리소스>.ts` — zod 스키마로 `safeParse`, 실패 시 400 `{ error: parsed.error.flatten() }`, 없는 id는 404
- [ ] 새 라우터라면 `backend/src/index.ts`에 `app.use("/api/<리소스>", ...)` 등록
- [ ] 스키마 변경이면 `backend/src/db/index.ts`에 `CREATE ... IF NOT EXISTS` (기존 데이터와 호환되게)
- [ ] 계산 로직은 `services/`의 순수 함수로 두고 `backend/test/`에 테스트
- [ ] `frontend/src/types/index.ts` 응답 타입
- [ ] `frontend/src/api/client.ts` 호출 함수
- [ ] `README.md` API 개요 표
- [ ] `harness/smoke.sh`에 정상 1건 + 검증 실패 1건 `expect` 추가
- [ ] `harness/check.sh` && `harness/smoke.sh` PASS

참고 구현: `backend/src/routes/dividends.ts` (목록/요약/생성/삭제 패턴).
