"use client";

import { useEffect } from "react";

// 과거 next-pwa로 생성됐던 서비스워커(public/sw.js, 이제 삭제됨)가 예전 방문자
// 브라우저에 여전히 남아 오래된 빌드 청크를 캐싱하고 있을 수 있어 강제 해제한다.
export default function ServiceWorkerUnregister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => reg.unregister());
      });
    }
  }, []);

  return null;
}
