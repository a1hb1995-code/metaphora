# 주식 포트폴리오 관리

보유 종목, 매수/매도 기록, 실시간 시세, 배당금을 관리하는 풀스택 웹 애플리케이션입니다.

## 구성

- `backend/` — Express + TypeScript + SQLite (better-sqlite3) API 서버
- `frontend/` — React + Vite + TypeScript, Recharts 기반 대시보드

## 주요 기능

- 보유 종목 관리 (매수/매도 거래 기록 CRUD)
- Yahoo Finance 기반 실시간/최신 주가 조회 (`yahoo-finance2`)
- 포트폴리오 통계/차트 (종목 비중, 일별·월별 손익 추이)
- 배당금 기록 및 월별/연도별/종목별 통계

## 실행 방법

### 백엔드

```bash
cd backend
npm install
npm run dev   # http://localhost:4000
```

SQLite 데이터베이스 파일은 `backend/data/portfolio.db`에 자동 생성됩니다.

### 프론트엔드

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

개발 서버는 `/api` 요청을 `http://localhost:4000`으로 프록시합니다.

## API 개요

| 엔드포인트 | 설명 |
| --- | --- |
| `GET/POST/PUT/DELETE /api/transactions` | 매수/매도 거래 기록 |
| `GET /api/holdings` | 현재 보유 종목 (실시간 시세 반영) |
| `GET /api/portfolio/summary` | 총 평가금액, 손익, 종목 비중 |
| `GET /api/portfolio/stats/daily?days=N` | 일별 손익 추이 |
| `GET /api/portfolio/stats/monthly?months=N` | 월별 손익 추이 |
| `GET/POST/DELETE /api/dividends` | 배당금 기록 |
| `GET /api/dividends/summary` | 배당금 통계 (연도별/월별/종목별) |
| `GET /api/quotes/:symbol` | 단일 종목 시세 조회 |
| `GET /api/quotes/search?q=` | 종목 검색 |

## 참고

- 시세/차트 데이터는 Yahoo Finance 비공식 API(`yahoo-finance2`)를 사용합니다. 네트워크 정책에 따라 외부 API 접근이 차단된 환경에서는 시세 조회가 실패할 수 있으며, 이 경우 보유 종목의 평가금액은 평균 매입가를 기준으로 대체 표시됩니다.
