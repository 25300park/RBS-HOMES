// side-bar-wrap.tsx
"use client";

import React, { useMemo } from "react";
import MapSideBar from "../components/map-side-bar";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface SideBarWrapProps {}

const SideBarWrap = React.memo(({}: SideBarWrapProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // 사이드바 컴포넌트 메모이제이션
  const SideBarComponent = useMemo(() => 
    isMobile ? <MobileMapSideBar /> : <MapSideBar />,
    [isMobile]
  );

  // 조건부 렌더링 대신 CSS로 처리
  return (
    <div className="relative">
      {SideBarComponent}
    </div>
  );
});

SideBarWrap.displayName = "SideBarWrap";

export default SideBarWrap;