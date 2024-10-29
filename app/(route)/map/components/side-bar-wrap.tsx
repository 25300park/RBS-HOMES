"use client";

import MapSideBar from "../components/map-side-bar";
import MobileMapSideBar from "@/app/(route)/map/components/mobile-map-side-bar";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface SideBarWrapProps {}

const SideBarWrap = ({}: SideBarWrapProps): React.ReactNode => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return <div>{isMobile ? <MobileMapSideBar /> : <MapSideBar />}</div>;
};

export default SideBarWrap;
