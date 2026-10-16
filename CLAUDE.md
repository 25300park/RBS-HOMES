# rbs-homes (front) 개발 지침

## 작업 규칙 (필수)
- 작업 폴더는 이 레포 루트뿐이다. 하위 중첩 폴더에서 작업 금지.
- 커밋/push는 사용자의 명시적 지시가 있을 때만. 임의로 하지 말 것.
- 파일 수정 후에는 diff만 보여주고 멈춘다. 다음 단계로 임의 진행 금지.
- 여러 단계 작업은 각 단계 후 정지하고 사용자 확인을 기다린다.
- 커밋 시 `git add`로 대상 파일을 콕 집어서 스테이징한다. `git add -A`/`git add .` 지양 (무관한 파일 유입 방지).
- PowerShell에서 괄호가 든 경로는 반드시 따옴표로 감쌀 것 (예: `"app/(route)/..."`).
- PowerShell 경로 이동은 `Set-Location -LiteralPath` 사용.
- 파일 쓰기는 BOM 없이 (UTF-8 no BOM).

## 프로젝트 정보
- Next.js 14, Railway MySQL, Prisma.
- 로컬 루트: `D:\01. RBS-HOMES Backup\01. RBS-HOMES`
- 운영 레포: `25300park/RBS-HOMES` (main 브랜치)
- EC2 경로: `C:\[WEB]\mr_homes_user_v4` / PM2 앱명: `front-rbs`
- 포트: 3000

## 주의 (반복 함정)
- Unit 주소 필드: front는 **fullAddress (d 두 개)** 사용. (admin은 fullAdress d 하나 — 레포마다 다르니 혼동 주의)
- `RBS_SYNC_SECRET=rbs-crm-sync-2026`

## 배포 (자동)
- main에 push → GitHub Actions 자동배포 → EC2 자동 pull/build/restart → Telegram 알림.
- EC2에 커밋 안 된 잔여 변경이 있으면 자동 pull이 충돌로 실패할 수 있음.

## 테스트 계정 (level / ID)
- tenant@test.com / test1234 (level 5, ID 180)
- owner@test.com / test1234 (level 4, ID 181)
- agent@test.com / test1234 (level 2, ID 182)

## ⚠️ 이중 서버 아키텍처 (2026-07-21 확정, 매우 중요)
- rbs-homes.com은 **EC2와 Vercel 두 서버가 동시에 운영 중**이다. 둘 다 같은 GitHub 레포에서 자동배포됨.
  - EC2: `54.254.24.249:3000`, PM2 `front-rbs`, GitHub Actions가 push마다 pull+build+restart.
  - Vercel: 같은 레포를 GitHub 연동으로 자동배포.
- **실제 사용자 트래픽(rbs-homes.com 도메인)은 Vercel이 처리한다.** EC2는 봇/스캐너만 직접 IP로 찍힐 뿐, 실사용자 요청 로그가 거의 안 남는다.
- **디버깅 시 EC2 pm2 logs보다 Vercel 대시보드(Deployments → Logs/Functions)를 먼저 확인할 것.** "코드는 맞는데 왜 로그가 안 찍히지?"의 실제 원인이 대부분 여기다.
- **환경변수는 EC2 `.env`와 Vercel 대시보드에 각각 따로 등록해야 한다.** 한쪽에만 넣으면 조용히 실패한다 (예: 2026-07-19 EMAIL_USER 누락, 2026-07-21 RESEND_API_KEY 누락으로 빌드 자체가 실패한 사례).
- **새 환경변수를 참조하는 코드는, 그 환경변수를 EC2+Vercel 양쪽에 먼저 등록한 뒤에 push할 것.** 모듈 최상단에서 즉시 실행되는 SDK 생성자(`new Resend(process.env.KEY)` 등)는 값이 없으면 Vercel 빌드 자체를 실패시킬 수 있다 (다른 페이지까지 전부 빌드 실패).

## DB 마이그레이션 검증 (2026-07-21 교훈)
- `prisma migrate status`가 "up to date"라고 해도 **맹신하지 말 것.** 마이그레이션 장부(`_prisma_migrations`)와 실제 DB 상태가 어긋날 수 있다 (EC2/레포 간 마이그레이션 파일명 불일치로 실제 겪음).
- 스키마 변경 후에는 항상 Railway 콘솔에서 `SHOW COLUMNS FROM <table>`로 실측 확인할 것.
- EC2에서 `npx prisma migrate deploy` 전에는 항상 `git log --oneline -3`으로 로컬이 origin/main과 같은 커밋인지 먼저 확인 (EC2가 최신 코드를 못 받은 채로 마이그레이션 명령만 실행하면 엉뚱한 결과가 남).

## 디버깅 순서 (권장)
1. `git log`/`git status`로 커밋·push·EC2 동기화 상태 확인
2. Vercel Deployments에서 최신 커밋이 Ready인지 확인
3. Vercel Logs에서 해당 API 라우트 로그 확인 (EC2 pm2 logs는 보조 수단)
4. 그래도 안 잡히면 브라우저 F12 Network 탭에서 실제 요청/응답 직접 확인

## Breakpoint 시스템 (중요, 자주 오해됨)
tailwind.config.ts는 리버스(max-width) breakpoint를 씁니다.
- md: { max: "767px" }, lg: { max: "1023px" } 등
- prefix 없는 클래스 = 넓은 화면(데스크톱) 기본값
- md:/lg: 등 prefix 붙은 클래스 = 그 해상도 "이하"일 때 적용 (즉 좁은 화면/모바일 전용)
- 표준 Tailwind(min-width)와 정반대이니, 반응형 클래스 작성/수정 시 항상 이 방향을 먼저 확인할 것
- 이 설정 파일이 표준 방식(sm: '640px' 등)으로 보이면, 그건 uncommitted 로컬 변경일 가능성이 높음 — git status/git diff로 확인 후 작업할 것

## 빌드 검증 시 필수 절차
로컬 npm run build/tsc --noEmit 성공 결과를 신뢰하기 전에:
  Remove-Item tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
  Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
  npm run build
위 캐시 삭제 없이 나온 "빌드 성공"은 신뢰하지 말 것 — tsconfig.tsbuildinfo 증분 캐시가 실제 타입 에러를 숨긴 전례 있음.

## 커밋 전 필수 점검
- git status --short 전체를 한 줄씩 검토 (untracked 디렉토리는 한 줄로 뭉쳐 표시되니 안까지 펼쳐서 확인)
- 새로 추가/복원하는 파일 중 "demo", "test", "debug"가 이름에 들어간 것은 인증 우회/보안 문제 없는지 특히 주의해서 검토
- 여러 AI 도구(Claude Code, Antigravity 등)를 오가며 작업 중이니, 다른 도구가 만든 변경사항이 uncommitted 상태로 남아있을 수 있음 — 작업 시작 전 git status로 항상 현재 상태 확인

# CLAUDE.md에 추가할 규칙 

> 기존 CLAUDE.md에 이미 있는 규칙과 겹치면 기존 것을 유지하고, 없는 것만 추가한다.
> 같은 내용을 AGENTS.md에도 두면 Codex도 따른다.

## 작업 시작 전

1. 브리프가 있으면 `docs/briefs/<ID>-*.md`를 읽고 시작한다. 브리프의 "범위 밖"은 지킨다.
2. 승인 등급과 금지 사항은 `docs/approval-policy.md`를 따른다.
3. **작은 작업**은 브리프 없이 진행할 수 있다. 조건은 모두 만족해야 한다. 1등급이고, 변경 파일이 5개 이하이고, DB, 인증, 발송, 환경변수, 개인정보를 건드리지 않는 것이다. 이때도 PR 설명에 목표와 확인 방법을 쓴다.
4. 3등급이거나 등급이 불확실하면 구현 전에 계획을 PR 설명에 쓰고 승인을 기다린다.
5. 모르는 것은 추측하지 말고 멈춰서 묻는다.

## 환경

- 개발은 로컬 DB만 쓴다. 운영 DB 주소로 접속하지 않는다.
- `.env*`는 읽거나 수정하거나 출력하지 않는다. 비밀값은 로그, 커밋, PR에 남기지 않는다.
- 로컬과 CI에서 `EMAIL_MODE`는 `off`다. 실제 사용자에게 메일이나 푸시를 보내지 않는다.
- 새 환경변수가 필요하면 브리프에 적고, Vercel(Production과 Preview 구분)과 EC2에 등록한 뒤 코드를 올린다. 모듈 최상단에서 환경변수가 없을 때 예외를 던지면 빌드 전체가 깨진다.
- 운영 서버 배포와 운영 마이그레이션 실행은 하지 않는다.

## 완료 조건

"완료"라고 쓰려면 아래를 실제로 실행하고 결과를 보고한다.

1. 클린 빌드: `tsconfig.tsbuildinfo`와 `.next`를 지우고 `npm run build`
2. 타입체크와 린트
3. 테스트 (핵심 흐름 테스트 포함)
4. 화면 변경이 있으면 375px, 768px, 1440px에서 확인 (실측값 또는 스크린샷)
5. 브리프의 수용 기준을 항목별로 확인

실행하지 않은 것을 실행했다고 쓰지 않는다. 통과하지 못한 항목은 그대로 보고한다.
테스트를 지우거나 건너뛰어서 통과시키지 않는다.

## Git

- 브랜치는 `feat/<ID>-<slug>`로 만들고 PR까지 만든다. `main`에 직접 푸시하지 않는다.
- 커밋은 최소 범위로 한다. 무관한 미커밋 변경(다른 도구가 만든 것 포함)은 섞지 않고 따로 보고한다.
- **커밋 메시지에 큰따옴표(`"`)를 쓰지 않는다.** 배포 알림 스크립트가 깨진다.
- 커밋하지 않은 파일에 의존하는 코드를 만들지 않는다. 새 파일은 `git status`로 하나씩 확인한다.

## 코드 규칙

- **인증과 권한**: 모든 API 라우트와 server action은 세션과 level을 서버에서 확인한다. 사용자 ID는 서버가 세션에서 정한다. 클라이언트가 보낸 ID를 신뢰하지 않는다. 세션이 없을 때 기본 사용자로 대체하는 코드를 만들지 않는다.
- **새 파일 점검**: 이름에 demo, test, debug가 들어간 라우트나 파일은 인증 우회가 없는지 직접 확인한다.
- **에러 응답**: 클라이언트에 원본 에러를 보내지 않는다. `lib/api-response.ts`의 `apiError`를 쓴다. 서버 로그에는 원본을 남긴다.
- **반응형**: 이 프로젝트의 브레이크포인트는 역방향(max-width)이다. `md:`는 767px 이하에 적용된다. 크기를 쓸 때 기본값이 데스크톱 최대이고 `lg:`, `sm:` 순으로 줄어든다. `tailwind.config.ts`가 표준처럼 보이면 `git diff`로 미커밋 변경인지 확인한다.
- **이미지 필드**: `unit.images`는 `parseImages`로 읽는다. 직접 `JSON.parse`하지 않는다.
- **칼럼 이름**: `fullAdress`(d가 하나)는 오타가 아니라 실제 칼럼 이름이다.
- **스키마 변경**: `prisma migrate dev`는 로컬 DB에서만 쓴다. 운영에 대한 마이그레이션은 하지 않는다. 마이그레이션 후에는 `SHOW COLUMNS`로 확인한다.

## 개인정보와 AI 규칙

- 임차인의 연락처와 신원을 외부 브로커에게 전달하는 코드를 만들지 않는다. 전달은 직원 승인을 거친다.
- 대화 원문과 AI 요약은 해당 방의 참여자와 허용된 역할만 읽는다. 열람하면 열람 기록을 남긴다.
- 방(대화)마다 AI에게 주는 컨텍스트를 분리한다. 한 방의 내용을 다른 방의 프롬프트에 넣지 않는다.
- 로그, 에러 메시지, 테스트 출력에 개인정보를 남기지 않는다. 테스트 데이터는 가짜 데이터만 쓴다.
- AI 프롬프트와 레드라인은 코드 파일로 관리하고 변경은 3등급이다.

## 발송 규칙

- 발송 전에 발송 장부에 먼저 기록한다 (수신자, 알림 종류, 대상, 기준 날짜가 같으면 한 번만).
- 기록 → 발송 → 상태 갱신 순서를 지킨다. 같은 요청이 두 번 와도 두 번째는 건너뛴다.
- 이메일은 하루 100통 한도를 넘기지 않도록 카운터를 확인한다.
- `EMAIL_MODE`가 `live`가 아니면 실제 수신자에게 보내지 않는다.
- 확인 요청은 외부 브로커가 올린 매물만 대상으로 한다.
