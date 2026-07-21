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
