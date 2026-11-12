#!/usr/bin/env node
// db:local:*, dev:local 전용 래퍼.
// .env.local의 DATABASE_URL만 읽어 쉘에 이미 있는 값보다 우선 적용하고,
// 최종 적용되는 값의 호스트가 로컬이 아니면 실제 명령을 실행하기 전에 중단한다.
// .env(확장자 없는 파일)는 어디에서도 읽지 않는다.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { isAllowedLocalHost } = require("./guard-local-db");

const ROOT = path.resolve(__dirname, "..");
const ENV_LOCAL_PATH = path.join(ROOT, ".env.local");

function readEnvLocalDatabaseUrl(filePath) {
  if (!fs.existsSync(filePath)) return undefined;

  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    if (key !== "DATABASE_URL") continue;

    let value = line.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    return value;
  }
  return undefined;
}

function maskedHostForLog(databaseUrl) {
  if (!databaseUrl) return "(없음)";
  try {
    return new URL(databaseUrl).hostname || "(알 수 없음)";
  } catch {
    return "(형식이 올바르지 않음)";
  }
}

function main() {
  const fromEnvLocal = readEnvLocalDatabaseUrl(ENV_LOCAL_PATH);
  if (fromEnvLocal) {
    // .env.local 값이 쉘에 이미 설정된 DATABASE_URL보다 우선한다.
    process.env.DATABASE_URL = fromEnvLocal;
  }

  const finalUrl = process.env.DATABASE_URL;

  if (!isAllowedLocalHost(finalUrl)) {
    console.error(
      `[guard-local-db] 거부: DATABASE_URL 호스트가 로컬이 아닙니다 (host=${maskedHostForLog(
        finalUrl
      )}). localhost, 127.0.0.1, host.docker.internal만 허용됩니다. 실제 접속을 시도하지 않고 중단합니다.`
    );
    process.exit(1);
  }

  const [command, ...args] = process.argv.slice(2);
  if (!command) {
    console.error("[with-local-db] 실행할 명령이 없습니다.");
    process.exit(1);
  }

  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  process.exit(result.status ?? 1);
}

main();
