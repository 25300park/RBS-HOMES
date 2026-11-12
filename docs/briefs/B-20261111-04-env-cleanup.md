# 브리프: B-20261111-04 환경변수와 의존성 정리

- **ID**: B-20261111-04
- **승인 등급**: 3 (환경변수 설정 문서, 의존성)
- **저장소**: rbs-homes
- **브랜치**: `feat/B-20261111-04-env-cleanup`
- **상태**: 승인됨 (조사 후 계획 승인 대기)

---

## 1. 목표
코드가 쓰지 않는 환경변수와 의존성을 정리하고, 환경변수 사용 현황을 문서로 남긴다.

## 2. 범위 안
- .env.example에서 코드가 읽지 않는 변수 줄 삭제 (사전 조사 기준)
- package.json에서 코드가 쓰지 않는 의존성 삭제 (nodemailer 등, 조사 기준), lock 갱신
- docs/env-vars.md 신규: 변수 이름, 용도, 서버 전용 또는 브라우저 노출, 필요한 환경(Production, 로컬). 값은 절대 쓰지 않는다.

## 3. 범위 밖
실제 .env 파일 읽기와 수정, Vercel/EC2/Railway 설정, 코드 로직 변경, NODE_TLS_REJECT_UNAUTHORIZED 변경

## 4. 영향받는 곳
.env.example, package.json, package-lock.json, docs/env-vars.md. DB 변경 없음.

## 5. 사전 조사 (읽기 전용. 결과를 10번에 쓰고 멈춘다)
1. process.env.* 와 NEXT_PUBLIC_* 사용처 전체 (이름, 파일, 서버 전용 또는 브라우저 구분)
2. .env.example의 각 변수가 코드에서 읽히는지
3. package.json 의존성 중 import가 없는 것 (nodemailer 외에도)
4. GEMINI_API_KEY, NEXT_PUBLIC_GOOGLE_KEY, CRM_* 의 사용처
5. NEXT_PUBLIC_ 이름에 SECRET, PASSWORD, TOKEN이 든 것 (지도 키 제외)
6. 삭제 후보 목록과 근거

## 6. 수용 기준
- [ ] AC-1: 삭제한 변수와 의존성마다 코드 검색 결과 사용 0건
- [ ] AC-2: docs/env-vars.md가 5번 조사의 모든 변수를 포함하고 값이 없다
- [ ] AC-3: CI / verify 통과, build:local 통과
- [ ] AC-4: 코드 로직 변경 0건 (.ts, .tsx 변경 없음)

## 8. 롤백
PR 되돌리기

## 10. 완료 보고 (에이전트가 채움)

### 10-0. 사전 조사 결과 (2026-11-12, 읽기 전용, 기준 커밋 `58c73e1`)

조사 방법: 추적 파일 전체에서 `process.env.X`, `process.env["X"]`, `env("X")`, 구조분해(`= process.env`)를 검색했다(`node_modules`, `.next` 제외). 실제 `.env`, `.env.local`은 읽지 않았다. `.env.example`은 범위 안 파일이라 읽었고, 값이 모두 한국어 자리표시자(예: `시크릿키`)이거나 localhost, 공개 도메인임을 확인했다. 실제 비밀값은 없다.

#### 조사 1. 코드가 읽는 환경변수 전체

| 변수 | 사용처 | 노출 구분 |
|---|---|---|
| `DATABASE_URL` | `prisma/schema.prisma:7`, `prisma/seed.js:8`, `prisma/seed-local.js:185`, `scripts/with-local-db.js`, `scripts/reset-local-db.js` | 서버 전용 |
| `NEXTAUTH_SECRET` | `lib/auth.ts:171-172`, `middleware.ts:20` | 서버 전용 |
| `NEXTAUTH_URL` | `server.js:50`, next-auth 내부 | 서버 전용 |
| `NEXT_PUBLIC_BASE_URL` | `lib/action.ts:773` (`use server`) | 이름상 브라우저 노출 가능. 현재는 서버에서만 읽음 |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | `lib/auth.ts:10-11` | 서버 전용 |
| `GOOGLE_PLACE_ID` | `app/api/google-reviews/route.ts:27` | 서버 전용 |
| `NEXT_PUBLIC_GOOGLE_KEY` | 브라우저: `components/modals/contact-modal.tsx:20`, `components/ui/static-map.tsx:41`, `app/(route)/account/components/address-search.tsx:13,109`, `lib/google.ts:8`(클라이언트 컴포넌트가 import). 서버: `app/api/google-reviews/route.ts:28`, `app/api/nearby/route.ts:43` | 브라우저 노출 |
| `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | `app/api/image-upload/{unit,profile,care-request,care-completion}/route.ts`, `app/api/contract-draft/[id]/upload/route.ts` | 서버 전용 |
| `RESEND_API_KEY` | `lib/email.ts:8` | 서버 전용 |
| `EMAIL_MODE`, `EMAIL_REDIRECT_TO` | `lib/email.ts:32,35` | 서버 전용 |
| `VERCEL_ENV` | `lib/email.ts:49` | 서버 전용 (Vercel이 자동 설정) |
| `ANTHROPIC_API_KEY` | `app/api/ai-search/route.ts:31`, `app/api/ai/extract-listing/route.ts:89`, `lib/chatbot/handle-message.ts:60` | 서버 전용 |
| `RBS_SYNC_SECRET` | `app/api/cron/expire-leases/route.ts:12-13`, `app/api/pms/leases/route.ts:18-19` | 서버 전용 |
| `CRM_SYNC_SECRET`, `CRM_ADMIN_ID` | `app/api/sync-unit/route.ts:29,77` | 서버 전용 |
| `KAKAO_SKILL_SECRET` | `app/api/chatbot/kakao/[secret]/route.ts:95` | 서버 전용 |
| `NODE_ENV` | `lib/prisma.ts:15`, `server.js:5,49` | 서버 (런타임 자동 설정) |
| `ANALYZE` | `next.config.mjs:4` | 빌드 시점 전용 (선택) |

`NEXT_PUBLIC_`가 붙은 변수 중 코드가 읽는 것은 `NEXT_PUBLIC_GOOGLE_KEY`, `NEXT_PUBLIC_BASE_URL` 두 개뿐이다.

#### 조사 2. .env.example 변수별 코드 사용 여부

| 줄 | 변수 | 코드 사용 | 판정 |
|---|---|---|---|
| 8, 10 | `DATABASE_URL` | 있음 | 유지 |
| 13 | `NEXT_PUBLIC_GOOGLE_KEY` | 있음 | 유지 |
| 14 | `NEXT_PUBLIC_SECRET_KEY` | **0건** | 삭제 후보 |
| 17-18 | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | 있음 | 유지 |
| 21 | `GOOGLE_PLACE_ID` | 있음 | 유지 |
| 22 | `GOOGLE_MAPS_URL` | **0건** (`ci.yml`, `local.env.example`에만 있음) | 삭제 후보 |
| 25 | `NEXT_PUBLIC_MAPTILER_API_KEY` | **0건** (`store/use-map-store.tsx`는 `Popup`만 쓰고 키 설정 없음) | 삭제 후보 |
| 28 | `NEXTAUTH_SECRET` | 있음 | 유지 |
| 30, 33 | `NEXTAUTH_URL` | 있음 | 유지 |
| 31, 34 | `NEXT_PUBLIC_BASE_URL` | 있음 | 유지 |
| 40-43 (주석) | `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`, `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY`, `NEXT_PUBLIC_AWS_REGION`, `NEXT_PUBLIC_S3_BUCKET_NAME` | **0건** | 삭제 후보 (36-39줄 S3 안내 주석 포함) |
| 46-50 | `R2_*` 5개 | 있음 | 유지 |
| 53 | `NEXT_PUBLIC_EMAIL_USER` | **0건** | 삭제 후보 |
| 54 | `NEXT_PUBLIC_EMAIL_APP_PASSWORD` | **0건** | 삭제 후보 |
| 60, 62 | `EMAIL_MODE`, `EMAIL_REDIRECT_TO` | 있음 | 유지 |

거꾸로, 코드는 읽지만 `.env.example`에 없는 변수가 있다: `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `RBS_SYNC_SECRET`, `CRM_SYNC_SECRET`, `CRM_ADMIN_ID`, `KAKAO_SKILL_SECRET`. 특히 `KAKAO_SKILL_SECRET`은 `local.env.example`과 `ci.yml`에도 없다. (추가는 이 브리프의 범위(삭제) 밖이다. 10-2 참고)

#### 조사 3. import가 없는 의존성

`git ls-files` 기준 코드와 설정 파일(.ts/.tsx/.js/.mjs/.cjs/.css/.json/.yml)에서 모듈 이름(`'pkg'`, `'pkg/...'`)을 검색하고, npm 스크립트의 실행 이름과 다른 패키지가 의존하는지(`npm explain`)도 확인했다.

| 패키지 | 위치 | import | 다른 패키지의 의존 | 판정 |
|---|---|---|---|---|
| `nodemailer` | dependencies | 0 | `next-auth`의 선택 peer(`peerDependenciesMeta.optional`). EmailProvider 사용 0건 | 삭제 후보 |
| `@types/nodemailer` | dependencies | 0 | 없음 | 삭제 후보 |
| `formik` | dependencies | 0 | 없음 | 삭제 후보 |
| `react-hook-form` | dependencies | 0 | 없음 | 삭제 후보 |
| `@tanstack/react-form` | dependencies | 0 | 없음 | 삭제 후보 |
| `next-form` | dependencies | 0 | 없음 | 삭제 후보 |
| `form` | dependencies | 0 (`responsive-drawer.tsx`의 `"form"`은 `ComponentProps<"form">` 문자열이라 import가 아님) | 없음 | 삭제 후보 |
| `react-calendar` | dependencies | 0 (CSS import도 0) | 없음 | 삭제 후보 |
| `quill` (^2.0.3) | dependencies | 0 | `react-quill`은 자기 하위의 `quill@1.3.7`을 씀 | 삭제 후보 |
| `@maptiler/geocoding-control` | dependencies | 0 | 없음 | 삭제 후보 |
| `maplibre-gl` (^4.7.0) | dependencies | 0 | `@maptiler/sdk`는 자기 하위의 `maplibre-gl@4.4.1`을 씀. 위 geocoding-control의 peer | 삭제 후보 (geocoding-control과 함께) |
| `@next-auth/prisma-adapter` | dependencies | 0 (`PrismaAdapter` 사용 0건) | 없음 | 삭제 후보 |
| `sharp` | dependencies | 0 | 없음. `next.config.mjs`가 `images.unoptimized: true`라서 Next 이미지 최적화도 안 씀 | **판단 필요** (10-2) |

import 0건이지만 유지하는 것:
- 타입 패키지 `@types/bcrypt`, `@types/bcryptjs`, `@types/google.maps`(전역 `google.maps.*` 사용), `@types/node`, `@types/react`, `@types/react-dom`
- 도구 `eslint`, `eslint-config-next`, `postcss`, `typescript`

#### 조사 4. 지정 변수 사용처

| 변수 | 결과 |
|---|---|
| `GEMINI_API_KEY` | 레포 전체에서 **0건** (코드, `.env.example`, `local.env.example`, `ci.yml` 모두 없음) |
| `NEXT_PUBLIC_GOOGLE_KEY` | 조사 1 표 참고. 브라우저 5곳, 서버 API 2곳 |
| `CRM_SYNC_SECRET` | `app/api/sync-unit/route.ts:29` (요청 인증 비교, 서버) |
| `CRM_ADMIN_ID` | `app/api/sync-unit/route.ts:77` (동기화 매물의 소유 관리자 ID, 기본값 1, 서버) |

#### 조사 5. NEXT_PUBLIC_ 이름에 SECRET, PASSWORD, TOKEN이 든 것

| 변수 | 위치 | 코드 사용 |
|---|---|---|
| `NEXT_PUBLIC_SECRET_KEY` | `.env.example:14` | 0건 |
| `NEXT_PUBLIC_EMAIL_APP_PASSWORD` | `.env.example:54` | 0건 |
| `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY` | `.env.example:41` (주석) | 0건 |

세 변수 모두 코드가 읽지 않는다. Next.js는 코드에서 참조하는 `NEXT_PUBLIC_*`만 번들에 넣으므로, 운영 환경에 값이 있더라도 현재 브라우저 번들에는 들어가지 않는다. 다만 운영 환경에 실제로 등록되어 있다면 지우는 것을 권장한다(범위 밖, 사람이 할 일).

#### 조사 6. 삭제 후보 요약

- **.env.example (9개 변수)**
  - 활성 줄: `NEXT_PUBLIC_SECRET_KEY`, `GOOGLE_MAPS_URL`, `NEXT_PUBLIC_MAPTILER_API_KEY`, `NEXT_PUBLIC_EMAIL_USER`, `NEXT_PUBLIC_EMAIL_APP_PASSWORD`
  - 주석 줄: `NEXT_PUBLIC_AWS_*` 4개
  - 함께 지울 주석 머리: `# MapTiler`, `# Email`, AWS S3 안내 블록(36-44줄)
  - 근거: 코드 사용 0건
- **package.json (12개)**: `nodemailer`, `@types/nodemailer`, `formik`, `react-hook-form`, `@tanstack/react-form`, `next-form`, `form`, `react-calendar`, `quill`, `@maptiler/geocoding-control`, `maplibre-gl`, `@next-auth/prisma-adapter`. 근거: import 0건, 다른 패키지의 필수 의존 없음.
- **판단 필요 (1개)**: `sharp`

### 10-1. 구현 계획 (승인 대기)

1. **.env.example**: 조사 6의 줄과 주석 머리만 삭제한다. 나머지 줄은 순서와 값을 그대로 둔다.
2. **package.json, package-lock.json**: `npm uninstall <조사 6의 12개>` 한 번으로 지우고 lock을 갱신한다. `sharp`는 승인 결과에 따른다. lock diff에서 남는 패키지의 버전이 바뀌지 않았는지 확인한다. 특히 하위에 중첩된 `quill@1.3.7`, `maplibre-gl@4.4.1`은 위치만 위로 올라갈 수 있다.
3. **docs/env-vars.md 신규**: 조사 1의 변수 전부(+ `GEMINI_API_KEY`는 "코드 사용 없음"으로 표기)를 이름, 용도, 노출 구분, 필요 환경(Production / Preview / 로컬 / CI)으로 정리한다. 값은 쓰지 않는다.
4. **확인**
   - AC-1: 삭제 항목마다 `git grep` 결과가 0건인지 확인한다.
   - AC-2: 문서의 변수 목록과 조사 결과를 대조하고, 값 패턴이 없는지 검색한다.
   - AC-3: 클린 설치(`npm ci`) 후 `tsc --noEmit`, lint, test, `.next`/`tsconfig.tsbuildinfo`를 지운 뒤 `build:local`을 실행한다. PR의 CI / verify 결과도 확인한다.
   - AC-4: `git diff --name-only`에 .ts/.tsx가 없는지 확인한다.
   - 화면 변경은 없으므로 해상도별 확인은 하지 않는다.
5. 커밋은 하나로 하고 PR을 만든다. 머지하지 않는다.

### 10-2. 판단이 필요한 항목

1. **`sharp` 삭제 여부**
   - 코드 사용 0건이고 `images.unoptimized: true`라서 지금은 쓰이지 않는다.
   - 다만 나중에 이미지 최적화를 켜면 EC2(`next start`)에서 다시 필요하다.
   - 권장: 이번에 삭제한다. 최적화를 켤 때 다시 추가한다.
2. **`.env.example`에 없는 사용 중 변수 6개 추가 여부**
   - 대상: `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `RBS_SYNC_SECRET`, `CRM_SYNC_SECRET`, `CRM_ADMIN_ID`, `KAKAO_SKILL_SECRET`
   - 브리프 범위(삭제)를 넘는다. 자리표시자 값으로 추가하는 것을 권장하지만, 승인이 있을 때만 한다.
3. **범위 밖 후속 제안 (이번에 하지 않음)**
   - `ci.yml`과 `local.env.example`에서 쓰지 않는 `GOOGLE_MAPS_URL`을 정리한다(`ci.yml`은 3등급).
   - `KAKAO_SKILL_SECRET`을 `local.env.example`과 `ci.yml`에 추가한다.
   - 서버 API(`google-reviews`, `nearby`)가 브라우저에 노출되는 `NEXT_PUBLIC_GOOGLE_KEY`를 같이 쓴다. 서버 전용 키로 분리할지 검토한다(코드 변경).
   - `next.config.mjs` `remotePatterns`의 옛 S3 호스트를 정리한다.
   - Vercel과 EC2에 `NEXT_PUBLIC_SECRET_KEY`, `NEXT_PUBLIC_EMAIL_*`, `GEMINI_API_KEY`가 등록되어 있다면 삭제한다(사람이 할 일).
4. **`NODE_TLS_REJECT_UNAUTHORIZED`**: 레포 안 사용 0건이다. 실제 환경 설정에만 있는 것으로 보인다. 범위 밖이라 손대지 않는다.

### 10-3. 구현 결과 (2026-11-12)

받은 결정:
1. `sharp`는 유지한다.
2. 의존성 12개는 삭제 전에 저장소 전체를 문자열 검색하고, 0건인 것만 삭제한다.
3. `.env.example`에 사용 중인 변수 6개를 자리표시자로 추가하고, `local.env.example`에 `KAKAO_SKILL_SECRET`의 가짜 값을 추가한다. `ci.yml`은 건드리지 않는다.

**삭제 전 문자열 검색** (`package.json`, `package-lock.json`, `docs/` 제외. 다른 이름의 일부(`react-quill`의 `quill` 등)가 아닌 단독 이름 기준)

| 패키지 | 검색 결과 | 처리 |
|---|---|---|
| `nodemailer`, `@types/nodemailer`, `formik`, `react-hook-form`, `@tanstack/react-form`, `next-form`, `react-calendar`, `@maptiler/geocoding-control`, `@next-auth/prisma-adapter` | 0건 | 삭제 (9개) |
| `form` | 32건: `<form>` 태그, `ComponentProps<"form">` 등. 모듈 import는 0건 | **유지, 보고** |
| `maplibre-gl` | 1건: `store/use-map-store.tsx:81` 주석 | **유지, 보고** |
| `quill` | 단독 이름 0건. 단순 문자열로는 4건(`react-quill/dist/quill.snow.css`, `import("react-quill")`) | 결정 2의 1건 규칙에 따라 **유지, 보고** |

세 패키지 모두 실제 import는 없다. 삭제할지는 다음 판단에 맡긴다.

**변경 파일**

| 파일 | 변경 내용 |
|---|---|
| `package.json` | 9개 삭제 |
| `package-lock.json` | 항목 28개 삭제. 남은 패키지의 버전 변경 0건, 위치 이동 0건, 새 패키지 0건. 추가된 줄은 `dev`/`devOptional` 표시뿐 |
| `.env.example` | 9개 변수(5줄 + 주석 4줄)와 주석 머리 삭제 |
| `.env.example` | 6개 변수 추가: `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `RBS_SYNC_SECRET`, `CRM_SYNC_SECRET`, `CRM_ADMIN_ID`, `KAKAO_SKILL_SECRET`. 값은 한국어 자리표시자 |
| `local.env.example` | `KAKAO_SKILL_SECRET` 가짜 값 추가 |
| `docs/env-vars.md` | 신규. 변수 24개와 코드가 읽지 않는 변수 목록. 값은 없다 |
| `.ts`, `.tsx` | 0건 |

**검증**

| 항목 | 결과 |
|---|---|
| 클린 설치 (`node_modules`, `.next`, `tsconfig.tsbuildinfo` 삭제 후 `npm ci`) | 통과 (npm allow-scripts 보류 경고만 있음) |
| `tsc --noEmit` | 통과 |
| `npm run lint` | 통과. 오류 0, 원래 있던 경고 111건 |
| `npm test` | 25/25 통과 |
| `.next`, `tsconfig.tsbuildinfo` 삭제 후 `npm run build:local` | 통과 |

**수용 기준**

| 기준 | 결과 |
|---|---|
| AC-1 | 통과. 삭제한 변수 9개는 코드 사용 0건이다. 삭제한 의존성 9개는 레포 검색 0건이고 lock 루트에서도 빠졌다. `GOOGLE_MAPS_URL`은 `ci.yml`과 `local.env.example`에 남아 있다(지시대로 손대지 않음, 후속 과제 1). |
| AC-2 | 통과. 조사 변수 24개와 `GEMINI_API_KEY`가 모두 들어 있고, 값 패턴 검색은 0건이다. |
| AC-3 | `build:local` 통과. CI / verify는 PR에서 확인한다. |
| AC-4 | 통과. `.ts`/`.tsx` 변경 0건. |

### 10-4. 후속 과제 (이번 PR에서 하지 않음)

1. **`ci.yml`에서 `GOOGLE_MAPS_URL` 제거**
   - 코드가 읽지 않는 변수다. `ci.yml` 변경은 3등급이다.
   - `local.env.example`의 같은 줄도 함께 정리한다.
2. **서버용과 브라우저용 Google 키 분리**
   - 지금은 브라우저에 노출되는 `NEXT_PUBLIC_GOOGLE_KEY`를 서버 API(`app/api/google-reviews/route.ts`, `app/api/nearby/route.ts`)도 같이 쓴다.
   - 서버 전용 키(예: `GOOGLE_SERVER_KEY`)를 새로 만들고, 브라우저 키는 HTTP referrer 제한, 서버 키는 IP·API 제한으로 나눈다.
   - 코드 변경이 있고 새 환경변수를 Vercel과 EC2에 먼저 등록해야 하므로 별도 브리프로 한다.

## 11. 승인 기록 (사람이 채움)
(작성 대기)
