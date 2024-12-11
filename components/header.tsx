"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";
import { IoMapOutline, IoListOutline } from "react-icons/io5";
import MainSearchBar from "./ui/main-search-bar";
import MainAmenityList from "./ui/main-amenity-list";
import MainFilterGroup from "./ui/main-filter-group";
import { useMediaQuery } from "@/hooks/use-media-query";

const MobileHeader = ({ pathName }: { pathName: string }) => {
  if (!["/", "/map"].includes(pathName)) {
    return null;
  }

  return (
    <header>
      <nav className="h-20 hidden md:flex fixed top-0 bg-white p-4 w-full gap-2 z-50 border-b shadow-md items-center justify-between">
        <div>
          <MainFilterGroup />
        </div>
        <MainSearchBar isMobile />

      </nav>
      <div className="mt-20" />
    </header>
  );
};

const DesktopHeader = ({
  navbarScrolled,
  setNavbarScrolled,
  session,
  pathName,
  openModal,
}: any) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);


  const handleExpandChange = (expanded: boolean) => {
    setIsSearchExpanded(expanded);
    if (expanded) {
      setNavbarScrolled(false);
    } else {
      // 검색창이 닫힐 때 현재 스크롤 위치에 따라 navbarScrolled 상태 결정
      setNavbarScrolled(window.scrollY > 50);
    }
  };

  const handleOverlayClick = () => {
    setIsSearchExpanded(false);
    // 오버레이 클릭 시 현재 스크롤 위치에 따라 navbarScrolled 상태 결정
    setNavbarScrolled(window.scrollY > 50);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-gray-200 md:hidden ${
          navbarScrolled ? "h-20 bg-white" : "h-44 bg-white"
        } w-full flex flex-col items-center`}
      >
        <div className="flex w-full items-center justify-between h-20 px-12">
          <div className="flex items-center">
            <Link className="mr-16" href="/">
              <img src="/assets/images/rbs-logo.png" alt="logo" />
            </Link>
          </div>

          {(pathName !== "/" || (pathName === "/" && !navbarScrolled)) && (
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className={`hover:border-gray-200 border-b flex items-center gap-2 ${
                  pathName === "/" ? "text-black border-gray-200" : "text-gray-400 border-transparent"
                }`}
              >
                <IoListOutline className="text-xl" />
                <p>View as list</p>
              </Link>
              <Link
                href="/map"
                className={`flex items-center hover:border-gray-200 border-b gap-2 ${
                  pathName.startsWith("/map") ? "text-black border-gray-200" : "text-gray-400 border-transparent"
                }`}
              >
                {/* <IoMapOutline className="text-xl" /> */}
                <img src="/assets/icons/map.gif" alt="map" className="w-9"/>
                <p>View on map</p>
              </Link>
            </div>
          )}

          <div className="flex items-center space-x-4 w-[250px] justify-end">
            {session === null ? (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-md text-[#6f6f6f]"
                  onClick={() => openModal("login")}
                >
                  LOGIN
                </Button>
                <span className="text-[#717171] mx-2">|</span>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-md text-[#6f6f6f]"
                  onClick={() => openModal("signup")}
                >
                  SIGN-UP
                </Button>
              </>
            ) : (
              <HeaderUserProfile session={session} />
            )}
          </div>
        </div>
        <div className="relative w-full flex justify-center">
          {pathName === "/" && (
            <MainSearchBar 
              navbarScrolled={navbarScrolled} 
              onExpandChange={handleExpandChange}
            />
          )}
        </div>
      </nav>

      {/* 검색창 활성화 시 나타나는 오버레이 */}
      {isSearchExpanded && (
        <div 
          onClick={handleOverlayClick}
          className="fixed inset-0 bg-black/30 transition-opacity duration-300 z-40"
        />
      )}
    </>
  );
};

const Header = () => {
  const { data: session, status } = useSession();
  const { openModal } = useModalStore();
  const pathName = usePathname();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pathName === "/") {
      const handleScroll = () => {
        setNavbarScrolled(window.scrollY > 50);
      };

      window.addEventListener("scroll", handleScroll);
      setNavbarScrolled(window.scrollY > 50);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
      setNavbarScrolled(true);
    }
  }, [pathName]);

  if (!mounted || status === "loading") {
    return <HeaderSkeleton pathname={pathName} />;
  }

  if (isMobile) {
    return <MobileHeader pathName={pathName} />;
  }

return (
  <header className="w-full">
    <DesktopHeader
      navbarScrolled={navbarScrolled}
      setNavbarScrolled={setNavbarScrolled}
      session={session}
      pathName={pathName}
      openModal={openModal}
    />
    <div className={`${pathName === "/" ? "h-44" : "h-20"} relative z-30`} />
    <div
      className={`${
        navbarScrolled
          ? "fixed w-full bg-white top-20 z-30 transition-all duration-300"
          : "w-full bg-white"
      }`}
    >
      {(pathName === "/" || pathName.includes("map")) && (
        <div className="flex w-full md:flex-col pt-4 px-20 3xl:px-12 xs:px-4 border-b md:p-4 md:gap-4">
          <MainFilterGroup />
          <MainAmenityList />
        </div>
      )}
    </div>
  </header>
);
};

const HeaderSkeleton = ({ pathname }: { pathname: string }) => (
  <>
    <div className="w-full fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-md">
      <div className="flex justify-between items-center h-20 px-12">
        <div className="flex items-center">
          <Link href="/">
            <img src="/assets/images/rbs-logo.png" alt="logo" className="w-24 h-auto" />
          </Link>
        </div>
        <div className="flex items-center space-x-4 w-[250px] justify-end">
          <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse" />
          <span className="text-[#717171] mx-2">|</span>
          <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
    <div className={pathname === "/" ? "mt-44 md:mt-32" : "mt-20 md:mt-32"} />
  </>
);

export default Header;