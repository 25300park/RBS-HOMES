// 로컬 전용 스크립트가 실수로 운영/원격 DB에 연결되지 않도록 막는 순수 판정 함수.
// 파일 I/O, 네트워크 접속 없음 — DATABASE_URL 문자열만 보고 호스트를 판정한다.

const ALLOWED_HOSTS = new Set(["localhost", "127.0.0.1", "host.docker.internal"]);

function isAllowedLocalHost(databaseUrl) {
  if (!databaseUrl) return false;

  let parsed;
  try {
    parsed = new URL(databaseUrl);
  } catch {
    return false;
  }

  return ALLOWED_HOSTS.has(parsed.hostname);
}

module.exports = { isAllowedLocalHost, ALLOWED_HOSTS };
