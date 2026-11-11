# CI
`.github/workflows/ci.yml`은 main 대상 PR마다 `pull_request`로 돌고, `workflow_dispatch`로 수동 실행도 된다. job 이름 `verify`, 워크플로 이름 `CI` — 브랜치 보호 필수 검사에 이 이름을 쓴다.

**하는 일 (한 job, 순서대로)**: `npm ci` → `npx prisma generate` → `npx tsc --noEmit` → `npm run lint` → `npm test`(vitest) → `npm run build`.

같은 PR의 이전 실행은 새 실행 시작 시 취소된다. `permissions`는 `contents: read` 하나, secrets 참조 없음. 환경변수는 전부 워크플로 안의 가짜 값(운영 DB/키 아님). `.next`, `tsconfig.tsbuildinfo`는 캐시하지 않는다.

**로컬 재현**: `rm -rf .next tsconfig.tsbuildinfo && npm ci && npx prisma generate && npx tsc --noEmit && npm run lint && npm test && npm run build`

`npm run build`는 `DATABASE_URL`이 가짜여도 끝난다 — sitemap/구글 리뷰 조회가 에러를 내부에서 잡기 때문(로컬 확인함).

**Node 버전**: `.nvmrc`/`engines`/`deploy.yml` 어디에도 명시가 없어 `@types/node ^20`을 증거로 Node 20을 쓴다. EC2 실제 버전은 미확인.

**vitest ↔ @types/node**: vitest 5.x는 `@types/node ^22` 이상을 요구해 이 프로젝트의 `^20`과 충돌한다(실제로 겪어서 `^4.1.12`로 고정). `@types/node`를 올릴 때는 `npm view vitest@<ver> peerDependencies`로 vitest 호환도 같이 확인한다.
