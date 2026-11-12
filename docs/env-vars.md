# 환경변수 목록

코드가 읽는 환경변수와 그 용도를 정리한다. **값은 이 문서에 쓰지 않는다.**

- 기준: 2026-11-12 조사 (브리프 `docs/briefs/B-20261111-04-env-cleanup.md`).
- 템플릿: 운영 항목은 `.env.example`, 로컬 가짜 값은 `local.env.example`, CI 가짜 값은 `.github/workflows/ci.yml`의 `env`.
- 운영 서버가 두 대다(Vercel, EC2). Production 표시가 있는 변수는 **Vercel 대시보드와 EC2 `.env` 양쪽**에 등록해야 한다.
- 새 변수를 참조하는 코드는 양쪽에 먼저 등록한 뒤에 push한다.

## 표 읽는 법

- **노출**
  - `서버`: 서버 코드에서만 읽는다.
  - `브라우저`: `NEXT_PUBLIC_` 변수라 클라이언트 번들에 값이 들어간다. 공개되어도 되는 값만 둔다.
- **필요 환경**
  - `필수`: 없으면 기능이 깨지거나 빌드나 실행이 실패한다.
  - `선택`: 없어도 기본 동작을 한다.
  - `자동`: 플랫폼이 설정한다.
  - `-`: 쓰지 않는다.
  - 로컬과 CI에는 가짜 값만 쓴다.

## 변수

| 이름 | 용도 | 노출 | Production | Preview | 로컬 | 읽는 곳 |
|---|---|---|---|---|---|---|
| `DATABASE_URL` | MySQL 접속 주소 (Prisma) | 서버 | 필수 | 필수 | 필수 (localhost만, 가드 스크립트가 검사) | `prisma/schema.prisma`, `prisma/seed*.js`, `scripts/with-local-db.js`, `scripts/reset-local-db.js` |
| `NEXTAUTH_SECRET` | 세션 JWT 서명 | 서버 | 필수 | 필수 | 필수 | `lib/auth.ts`, `middleware.ts` |
| `NEXTAUTH_URL` | NextAuth 기준 URL | 서버 | 필수 | 필수 | 필수 | `server.js`, next-auth 내부 |
| `NEXT_PUBLIC_BASE_URL` | 사이트 기준 URL (링크 생성) | 브라우저 (현재는 서버에서만 읽음) | 필수 | 필수 | 필수 | `lib/action.ts` |
| `GOOGLE_CLIENT_ID` | Google OAuth 로그인 | 서버 | 필수 | 필수 | 필수 (가짜 값) | `lib/auth.ts` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 로그인 | 서버 | 필수 | 필수 | 필수 (가짜 값) | `lib/auth.ts` |
| `GOOGLE_PLACE_ID` | Google 리뷰 조회 대상 장소 | 서버 | 필수 | 선택 | 선택 | `app/api/google-reviews/route.ts` |
| `NEXT_PUBLIC_GOOGLE_KEY` | Google Maps/Places 키. 브라우저 지도와 서버 API(`google-reviews`, `nearby`)가 함께 쓴다 | 브라우저 | 필수 | 필수 | 선택 | `lib/google.ts`, `components/modals/contact-modal.tsx`, `components/ui/static-map.tsx`, `app/(route)/account/components/address-search.tsx`, `app/api/google-reviews/route.ts`, `app/api/nearby/route.ts` |
| `R2_ENDPOINT` | Cloudflare R2 엔드포인트 (이미지·계약서 업로드) | 서버 | 필수 | 필수 | 선택 | `app/api/image-upload/*/route.ts`, `app/api/contract-draft/[id]/upload/route.ts` |
| `R2_ACCESS_KEY_ID` | R2 접근 키 ID | 서버 | 필수 | 필수 | 선택 | 위와 같음 |
| `R2_SECRET_ACCESS_KEY` | R2 비밀 키 | 서버 | 필수 | 필수 | 선택 | 위와 같음 |
| `R2_BUCKET_NAME` | R2 버킷 이름 | 서버 | 필수 | 필수 | 선택 | 위와 같음 |
| `R2_PUBLIC_URL` | 업로드 파일의 공개 URL 접두사 | 서버 | 필수 | 필수 | 선택 | 위와 같음 |
| `RESEND_API_KEY` | Resend 메일 발송 | 서버 | 필수 | 선택 (redirect 모드일 때 필수) | 선택 (`EMAIL_MODE=off`) | `lib/email.ts` |
| `EMAIL_MODE` | 발송 스위치 `off` / `redirect` / `live`. 없거나 모르는 값이면 `off` | 서버 | 필수 (`live`) | 선택 (`redirect` 또는 `off`) | `off` | `lib/email.ts` |
| `EMAIL_REDIRECT_TO` | `redirect` 모드에서 모든 메일을 받을 개발자 주소 | 서버 | - | `redirect`일 때 필수 | - | `lib/email.ts` |
| `VERCEL_ENV` | `live` 발송을 Vercel Production에서만 허용하는 판단 | 서버 | 자동 (Vercel만) | 자동 | - | `lib/email.ts` |
| `ANTHROPIC_API_KEY` | AI 검색, AI 매물 추출, 챗봇 | 서버 | 필수 | 선택 | 선택 (가짜 값) | `app/api/ai-search/route.ts`, `app/api/ai/extract-listing/route.ts`, `lib/chatbot/handle-message.ts` |
| `RBS_SYNC_SECRET` | 크론·내부 동기화 요청 인증 | 서버 | 필수 | 선택 | 선택 (가짜 값) | `app/api/cron/expire-leases/route.ts`, `app/api/pms/leases/route.ts` |
| `CRM_SYNC_SECRET` | CRM → 매물 동기화 요청 인증 | 서버 | 필수 | 선택 | 선택 (가짜 값) | `app/api/sync-unit/route.ts` |
| `CRM_ADMIN_ID` | CRM 동기화 매물의 소유 관리자 사용자 ID (없으면 1) | 서버 | 선택 | 선택 | 선택 | `app/api/sync-unit/route.ts` |
| `KAKAO_SKILL_SECRET` | 카카오 챗봇 스킬 요청 인증 | 서버 | 필수 | 선택 | 선택 (가짜 값) | `app/api/chatbot/kakao/[secret]/route.ts` |
| `NODE_ENV` | 실행 모드 | 서버 | 자동 | 자동 | 자동 | `lib/prisma.ts`, `server.js` |
| `ANALYZE` | `true`이면 번들 분석기 실행 (빌드 시점) | 빌드 | - | - | 선택 | `next.config.mjs` |

## 코드가 읽지 않는 변수 (2026-11-12 `.env.example`에서 삭제)

아래 변수는 레포 안에서 읽는 곳이 없다. 운영 환경(Vercel, EC2)에 남아 있다면 지워도 된다.

| 이름 | 비고 |
|---|---|
| `NEXT_PUBLIC_SECRET_KEY` | 이름에 SECRET이 든 `NEXT_PUBLIC_` 변수. 코드가 참조하지 않아 번들에는 들어가지 않는다 |
| `NEXT_PUBLIC_EMAIL_USER` | nodemailer 시절의 설정. 지금은 Resend를 쓴다 |
| `NEXT_PUBLIC_EMAIL_APP_PASSWORD` | 이름에 PASSWORD가 든 `NEXT_PUBLIC_` 변수. 위와 같음 |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | `@maptiler/sdk`에 키를 설정하는 코드가 없다 |
| `GOOGLE_MAPS_URL` | `ci.yml`, `local.env.example`에도 남아 있음 (후속 정리 대상) |
| `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`, `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_AWS_REGION`, `NEXT_PUBLIC_S3_BUCKET_NAME` | R2로 이전한 옛 S3 설정 (주석 처리되어 있었음) |
| `GEMINI_API_KEY` | 레포 어디에도 없다. 운영 환경에만 있다면 쓰이지 않는 값이다 |

`NODE_TLS_REJECT_UNAUTHORIZED`도 레포 안에서 읽는 곳이 없다. 실제 환경 설정에만 있을 수 있다. 이 문서의 정리 대상이 아니므로 별도로 검토한다.
