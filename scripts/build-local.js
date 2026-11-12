#!/usr/bin/env node
// build:local: scripts/with-local-db.js로 가드를 통과한 뒤에만 실행된다.
// npm run build(prisma generate && next build)와 같은 단계를 거치지만,
// 이 스크립트는 항상 가드 뒤에서만 호출되므로 로컬 검증용으로 쓴다.
// npm run build 자체는 바꾸지 않는다(Vercel/EC2/CI가 그대로 사용).

const { spawnSync } = require("child_process");

function run(command, args) {
  console.log(`[build-local] $ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`[build-local] 실패: ${command} ${args.join(" ")} (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
}

run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);
