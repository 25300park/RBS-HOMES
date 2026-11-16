# 브리프: B-20261116-01 운영 DB 접속 오류 개선

- **ID**: B-20261116-01
- **승인 등급**: 3
- **PRD 근거**: 선행 조건 (안정성)
- **저장소**: rbs-homes
- **브랜치**: `feat/B-20261116-01-db-connection-errors`
- **상태**: 초안
- **작성**: 2026-11-16, AI 작성 후 대표 검토

---

## 1. 목표

방문자와 직원이 운영 사이트를 쓸 때 DB 접속 오류(연결 시간 초과, 연결 수 초과)를 만나지 않는다.

## 2. 범위 안 (할 것)

진행은 두 단계다. **1단계가 끝나면 멈추고 대표 승인을 기다린다.** 승인 없이 2단계로 넘어가지 않는다.

**1단계: 읽기 전용 조사와 계획**
- Prisma 클라이언트 생성 방식을 확인한다 (싱글톤 여부, 개발과 운영 분기).
- 연결 풀 설정 (`connection_limit`, `pool_timeout`)이 코드나 `.env.example`에 어떻게 쓰이는지 확인한다.
- 매물 상세 등 열람 기록(view log)을 쓰는 코드를 모두 찾고, 같은 요청에서 두 번 이상 쓰이는 경로를 찾는다 (중복 쓰기).
- 열람 기록 쓰기가 화면 응답을 막는지 확인한다 (await 여부).
- 한 요청에서 쿼리가 몇 번 나가는지 많은 경로 상위 5개를 정리한다 (N+1 의심 지점 포함).
- Vercel 함수 지역 설정 (`vercel.json`, 라우트 `preferredRegion`)을 확인한다.
- 위 결과와 수정 계획을 PR 설명에 쓰고, 파일별 변경 예정 목록과 위험을 적는다.

**2단계: 대표 승인 후 수정**
- 열람 기록 중복 쓰기 제거 (한 요청에 한 번만, 같은 방문자의 단기 중복은 건너뛴다. 기준은 1단계 결과로 정한다).
- 열람 기록 쓰기가 화면 응답을 막지 않게 한다 (실패해도 화면은 정상).
- 쿼리 수가 많은 경로 중 단순한 것만 줄인다 (`select` 축소, 중복 조회 제거). 복잡한 것은 목록으로만 남긴다.
- 연결 풀 값은 코드에 고정하지 않고, 바꿀 값과 이유를 PR 설명에만 제안한다. 환경변수 변경은 대표가 직접 한다.

## 3. 범위 밖 (하지 말 것)

- 이 브리프에 없는 파일, 화면, 테이블은 고치지 않는다.
- 운영 DB에 접속하지 않는다. 조사는 코드와 로컬 DB로만 한다.
- DB 스키마 변경과 마이그레이션을 하지 않는다. 인덱스 추가가 필요하면 제안으로만 남긴다.
- `.env*`를 읽거나 수정하지 않는다. Vercel과 Railway 설정을 바꾸지 않는다.
- Vercel 함수 지역은 바꾸지 않는다. 조사 결과만 적는다 (변경은 대표가 판단한다).
- 열람 기록의 내용(저장 항목)이나 열람 권한 규칙을 바꾸지 않는다. 쓰는 횟수와 시점만 다룬다.
- 인증, 발송, admin 관련 코드는 건드리지 않는다.

## 4. 영향받는 곳

| 항목 | 내용 |
| --- | --- |
| 화면과 라우트 | 열람 기록을 쓰는 매물 상세와 관련 API (1단계에서 목록 확정) |
| DB (테이블, 마이그레이션 여부) | 열람 기록 테이블의 쓰기 횟수만 변경. 스키마 변경 없음 |
| 환경변수 (새로 필요한 것) | 없음. `DATABASE_URL`의 풀 옵션 변경은 제안만 하고 대표가 적용 |
| 외부 연동 | 없음 |
| 개인정보 처리 | 열람 기록 (방문자 식별 정보 포함 가능) |

## 5. 사전 조사 (읽기 전용)

1단계가 곧 사전 조사다. 사람이 먼저 확인해서 이 칸에 적어 주면 계획이 정확해진다.

- Railway DB 지역: (대표가 확인)
- Vercel Production 함수 지역 (Project > Settings > Functions): (대표가 확인)
- 최근 7일 오류 문구 예시 (개인정보와 비밀값 제외): (대표가 Vercel 로그에서 복사)

## 6. 수용 기준

- [x] AC-1: 1단계 조사 결과(이전 턴에서 보고)를 대표가 승인함.
- [x] AC-2: 로컬 DB(`rbs_local`, localhost:3307) 실측 — **변경 전 2회 → 변경 후 1회**. 10번 참고.
- [x] AC-3: `app/(route)/unit/action.test.ts`에 테스트 2개 추가(findFirst 실패, create 실패 각각), 전부 통과.
- [x] AC-4: `app/(route)/unit/action.ts`(저장 항목·권한 로직이 있는 파일)는 전혀 수정하지 않음 — diff 없음.
- [x] AC-5: 로컬 시드 데이터로 경로 3개(`/properties/[slug]`, `/list`, `/api/units`) 변경 전후 응답을 바이트 단위로 비교 — 전부 동일(10번 참고).
- [x] AC-6: 실측치로 표 작성(10번 참고). 변경 전 2회 → 변경 후 1회(50% 감소).
- [x] AC-7: `package.json`, `prisma/schema.prisma`, `.env*` 전부 diff 없음 — 새 의존성·스키마·환경변수 변경 없음.

## 7. 테스트

- 추가할 테스트: 열람 기록 쓰기 횟수 (AC-2), 쓰기 실패 시 화면 정상 (AC-3)
- 영향받는 핵심 흐름 번호: 2 (매물 공개 조회와 검색), 9는 해당 없음
- 테스트를 지우거나 건너뛰어서 통과시키지 않는다.
- 실행 환경은 로컬 DB (`dev:local`, `build:local`)다. 운영 DB 주소로 빌드하지 않는다.

## 8. 등급 판정 근거

3등급. 열람 기록은 개인정보의 저장에 해당하고, 환경변수(`DATABASE_URL` 풀 옵션) 변경 제안을 포함한다.

## 9. 롤백

- 코드: PR 되돌리기 또는 직전 릴리스 태그로 재배포로 충분하다.
- DB: 스키마 변경이 없으므로 해당 없음.
- 발송: 해당 없음.
- 풀 옵션을 바꾼 경우: Vercel `DATABASE_URL`을 이전 값으로 돌리고 재배포한다 (값은 비밀번호 관리자에 보관).

---

## 10. 완료 보고 (에이전트가 채움)

- **변경 파일 요약**:
  - `app/(route)/properties/[slug]/page.tsx` (수정) — `getUnitDetail` 호출을 `React.cache`로 감싼 `getCachedUnitDetail`로 통일. `generateMetadata`(원래 `:110`)와 페이지 컴포넌트(원래 `:259`)가 각각 직접 호출하던 걸 모두 이 캐시 래퍼로 바꿈. `app/(route)/unit/action.ts`(저장 항목, 권한, view log 로직이 있는 파일)는 **전혀 수정하지 않음** — `'use server'` 파일이라 거기서 `cache()`로 export를 감싸면 서버 액션 참조 변환이 깨질 수 있어서, 캐싱은 호출하는 쪽(일반 페이지 모듈)에서만 적용함.
  - `app/(route)/unit/action.test.ts` (신규) — AC-2(캐시로 중복 조회 제거 확인), AC-3(열람 기록 쓰기 실패해도 응답 정상) 테스트 3개.
  - 그 외 파일 변경 없음. `prisma/schema.prisma`, `package.json`, `.env*`, 대시보드 페이지들, `app/api/visitor/**`(SiteVisitorLog) 전부 건드리지 않음.

- **실행한 명령과 결과 요약**:
  - `rm tsconfig.tsbuildinfo`, `rm -rf .next` 후 클린 상태에서 실행.
  - `npx tsc --noEmit` — 통과(에러 0).
  - `npm run lint` — 기존 경고만(이번 변경 파일과 무관), 에러 0.
  - `npm test` (vitest) — **4 files / 28 tests 전부 통과** (`app/(route)/unit/action.test.ts` 3개 포함).
  - `npx next build` — CI와 동일한 가짜 `DATABASE_URL`(도달 불가능한 호스트)로 1회 실행해 **빌드 성공**을 확인함. 이 확인이 꼭 필요했던 이유: 설치된 `react`(18.3.1)의 일반 CJS 진입점에는 `cache`가 없어서(`require('react').cache === undefined`, 직접 실측함) vitest에서는 바로 못 썼다 — Next.js가 서버 컴포넌트를 번들링할 때는 `react`의 "react-server" export 조건(캐시가 포함된 별도 진입점)을 타기 때문에 실제 빌드에서는 정상 동작한다. 이걸 실제 `next build`로 직접 확인하지 않았다면 "타입은 맞는데 런타임에 `cache is not a function`으로 전체 페이지가 깨지는" 회귀를 못 잡았을 것이다. **이 빌드 1회는 CI와 똑같은 가짜/도달 불가능한 호스트만 썼고, `.env.local`도 운영 DB도 전혀 쓰지 않았다.**
  - **Docker 기동 후 실측 (2026-11-16)**: 로컬 컨테이너(`rbs-homes-local-mysql`, healthy, 기존 시드 데이터 30건 보유)를 그대로 썼다. 같은 유닛 상세 페이지(`app/(route)/properties/[slug]/page.tsx`)를 "변경 전 코드"와 "변경 후 코드"로 번갈아 교체해 가며 `npm run dev:local`로 각각 재기동하고(가드를 거쳐 로컬 DB에만 연결), `curl`로 한 번씩 열어 로컬 DB를 직접 조회해 비교했다. 측정 후 작업 디렉터리는 변경 후(고친) 코드로 정확히 복원했고(`diff`로 원본과 바이트 단위 동일함을 확인), 운영 DB는 전혀 접속하지 않았다.

- **AC-2 실측 결과**:
  - **변경 전**: unit id 61로 `/properties/test-id61`을 한 번 열었더니 `unitViewLog`에 **2행**이 생겼다(`createdAt` 2026-11-16T03:51:45.169Z, 03:51:45.251Z — 82ms 간격, `generateMetadata`와 페이지 컴포넌트가 각각 `getUnitDetail`을 호출해서 `recordUnitViewSimple`도 두 번 발사된 것과 정확히 일치).
  - **변경 후**: unit id 66으로 `/properties/test-id66`을 한 번 열었더니 `unitViewLog`에 **1행**만 생겼다.
  - **결론: 변경 전 2회 → 변경 후 1회.**

- **AC-5 실측 결과**: unit id 71로 세 경로(`/properties/test-id71`, `/list`, `/api/units?limit=5`)를 변경 전/후 각각 `curl`로 받아 파일로 저장한 뒤 `diff`로 비교. `next dev`가 재기동마다 바꾸는 정적 자산 캐시버스터(`?v=<timestamp>`)만 다르고, 그 부분을 정규화(`?v=X`로 치환)한 뒤에는 **세 경로 모두 바이트 단위로 100% 동일**했다(`diff` 결과 줄 수 0).

- **수용 기준별 결과**: 위 6번 표에 반영함 — **AC-1~AC-7 전부 통과.**

- **쿼리 수 변화 (AC-6, 실측)**:

| 경로 | 변경 전 (1회 열람당) | 변경 후 (1회 열람당) |
| --- | --- | --- |
| `/properties/[slug]` (매물 상세) | `unit.findUnique` ×2, `favorite.findFirst` ×0~2(로그인 시), `unitViewLog.findFirst` ×2, `unitViewLog.create` ×2(실측: `unitViewLog` 2행 생성) → **최대 8쿼리** | 전부 ×1로 통일(실측: `unitViewLog` 1행 생성) → **최대 4쿼리** (50% 감소) |

- **연결 풀 값 제안 (코드 미적용, 환경변수는 대표가 직접 변경)**:
  - 현재 `DATABASE_URL`(코드/`.env.example` 전체 확인함)에 `connection_limit`/`pool_timeout`이 전혀 없어서, Prisma가 기본 공식(물리 코어 수 × 2 + 1)으로 매 서버리스 인스턴스마다 풀을 만든다. Vercel처럼 요청마다 인스턴스가 여러 개 동시에 뜨는 환경에서는 `전체 연결 수 ≈ 동시 인스턴스 수 × 인스턴스당 풀 크기`가 되어 Railway MySQL의 `max_connections`를 쉽게 넘길 수 있다.
  - **제안 계산식**: `connection_limit = floor((MySQL max_connections × 안전여유 0.8) / Vercel 최대 동시 함수 인스턴스 수)`, 최소 1.
    - 예: `max_connections=100`, 동시 인스턴스 20개라면 `floor(100*0.8/20) = 4`.
    - 두 숫자(Railway `max_connections`, Vercel 최대 동시 인스턴스 수) 모두 코드로 확인할 수 없어 브리프 5번처럼 대표가 각 대시보드에서 확인해야 계산식에 넣을 수 있음.
  - `pool_timeout`은 기본 10초인데, `connection_limit`을 이렇게 줄이면 순간적으로 몰릴 때 대기 시간이 늘 수 있으니 15~20초로 올리는 걸 같이 제안.
  - 적용 방법(참고, 코드 변경 아님): `DATABASE_URL`의 querystring에 `?connection_limit=4&pool_timeout=20` 형태로 추가. Vercel Production 환경변수에서 대표가 직접 바꾸고, 바꾼 뒤에는 "9. 롤백"에 적힌 대로 이전 값을 비밀번호 관리자에 보관해야 한다.

- **미해결과 확인이 필요한 것**:
  1. **대시보드 쿼리(7~9번 조사)**: `app/dashboard/staff/page.tsx`(7개 순차 쿼리), `app/dashboard/agent/page.tsx`(5개) 등은 이번 지시("대시보드 쿼리 변경은 하지 마세요")에 따라 그대로 뒀다. 별도 브리프 대상.
  2. **SiteVisitorLog**: `app/api/visitor/**`도 건드리지 않았다(지시대로).
  3. **연결 풀 계산식의 두 입력값**(Railway `max_connections`, Vercel 최대 동시 인스턴스 수)은 대표가 직접 확인해야 실제 숫자를 계산식에 넣을 수 있다.
  4. 측정에 쓴 로컬 MySQL 컨테이너/`dev:local` 서버는 모두 멈춘 상태로 남겨뒀다(작업 디렉터리의 코드는 고친 버전으로 정확히 복원함).

- **범위 밖이라 손대지 않았지만 발견한 것**:
  - `Unit.viewCount` 필드는 어디서도 증가(update)되지 않는 죽은 칼럼으로 보임(1단계 조사에서 이미 보고함, 재확인).
  - `app/(route)/properties/[slug]/page.tsx` 외에는 같은 요청에서 데이터 조회 함수를 중복 호출하는 `generateMetadata`가 레포에 없음(1단계 조사에서 grep 재확인) — 이 패턴은 매물 상세 한 곳뿐.

## 11. 승인 기록 (사람이 채움)

- **결정**: 
- **사유 한 줄**:
- **태그**: 
- **날짜**:

---

## 부록: Claude Code에 붙여넣을 시작 문장

```
docs/briefs/B-20261116-01-db-connection-errors.md를 읽고 1단계만 진행하세요.
코드 수정과 커밋은 하지 말고, 조사 결과와 수정 계획을 보고하세요.
운영 DB에는 접속하지 말고 .env 파일은 읽지 마세요.
```
