# 로컬 개발 환경

## 시작 순서
```
cp local.env.example .env.local
npm run db:local:up        # 로컬 MySQL 컨테이너(포트 3307) 기동
npm run db:local:migrate    # prisma migrate deploy
npm run db:local:seed       # 가짜 데이터 채우기
npm run dev:local            # next dev (localhost:3000)
```
초기화하고 싶으면 `npm run db:local:reset` (컨테이너 DB만 지우고 다시 만듦, 운영 영향 없음).

## 로컬 계정 (전부 가짜, @example.invalid, 비밀번호 전부 `LocalDev!2026`)
| 이메일 | level | 역할 |
| --- | --- | --- |
| admin@example.invalid | 0 | 관리자 |
| user@example.invalid | 1 | 일반유저 |
| agent@example.invalid | 2 | 에이전트 |
| broker@example.invalid | 3 | 브로커 |
| owner@example.invalid | 4 | 오너 |
| tenant@example.invalid | 5 | 세입자 |
| presale-agent@example.invalid | 20 | 프리세일 에이전트 |
| presale-broker@example.invalid | 30 | 프리세일 브로커 |

## 로컬에서 안 되는 것
- AI 기능(`ANTHROPIC_API_KEY`가 가짜 값) — 호출하면 실패한다.
- 파일 업로드(R2 키가 가짜 값) — 이미지/파일 업로드가 동작하지 않는다.
- 이메일(`EMAIL_MODE=off`, `RESEND_API_KEY`가 가짜 값) — 실제로 메일이 나가지 않는다.
- 운영 DB 접속 — `db:local:*`/`dev:local`은 `DATABASE_URL` 호스트가 localhost/127.0.0.1/host.docker.internal이 아니면 즉시 거부된다.
