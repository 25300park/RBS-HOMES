#!/usr/bin/env node
// db:local:reset: 로컬 컨테이너의 DB만 지우고 처음부터 다시 만든다.
// 항상 scripts/with-local-db.js를 통해 실행되지만, 직접 실행되는 경우에
// 대비해 같은 가드를 한 번 더 건다.

const { spawnSync } = require("child_process");
const { isAllowedLocalHost } = require("./guard-local-db");

function run(command, args) {
  console.log(`[reset-local-db] $ ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`[reset-local-db] 실패: ${command} ${args.join(" ")} (exit ${result.status})`);
    process.exit(result.status ?? 1);
  }
}

function main() {
  if (!isAllowedLocalHost(process.env.DATABASE_URL)) {
    console.error(
      "[guard-local-db] 거부: DATABASE_URL 호스트가 로컬이 아닙니다. localhost, 127.0.0.1, host.docker.internal만 허용됩니다. 중단합니다."
    );
    process.exit(1);
  }

  run("docker", ["compose", "down", "-v"]);
  run("docker", ["compose", "up", "-d", "--wait"]);
  // prisma db push는 항상 with-local-db.js(가드)를 거쳐서만 실행한다.
  run("node", ["scripts/with-local-db.js", "npx", "prisma", "db", "push", "--skip-generate"]);
  run("node", ["prisma/seed-local.js"]);

  console.log("[reset-local-db] 완료.");
}

main();
