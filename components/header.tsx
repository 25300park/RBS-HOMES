"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";
import { IoMapOutline, IoListOutline, IoSearch } from "react-icons/io5";
import { amenitiesData } from "@/lib/config/amenities";
import MainAmenityList from "./ui/main-amenity-list";
export interface HeaderProps {}

const Header = ({}: HeaderProps): React.ReactNode => {
  const { data: session } = useSession();
  const { openModal } = useModalStore();
  const pathName = usePathname();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const router = useRouter();
  console.log(pathName);
  useEffect(() => {
    if (pathName === "/") {
      const handleScroll = () => {
        // 스크롤 위치에 따라 네브바 색상 및 높이 변경
        if (window.scrollY > 50) {
          setNavbarScrolled(true);
        } else {
          setNavbarScrolled(false);
        }
      };

      window.addEventListener("scroll", handleScroll);

      // 페이지 초기화 시 스크롤 상태 리셋
      setNavbarScrolled(false);

      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    } else {
      // 다른 페이지에서는 스크롤 이벤트를 사용하지 않고 항상 스크롤된 상태로 유지
      setNavbarScrolled(true);
    }
  }, [pathName]);

  return (
    <header className="w-full">
      {/* 헤더 */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b border-gray-200 ${
          navbarScrolled ? "h-20  bg-white" : "h-44 bg-white"
        } w-full flex flex-col items-center`}
      >
        {/* 헤더 상단 (로고 및 네비게이션 링크) */}
        <div className="flex w-full items-center justify-between h-20 px-12">
          {/* 왼쪽: 로고 및 네비게이션 링크 */}
          <div className="flex items-center">
            <Link className="mr-16" href={"/"}>
              <img src="/assets/images/RBS_logo.png" alt="logo" />
            </Link>
          </div>

          {/* 가운데: View 버튼들 */}
          {(pathName !== "/" || (pathName === "/" && !navbarScrolled)) && (
            <div className="flex items-center gap-6 ">
              <Link
                href={"/"}
                className={`p-4 rounded-full border flex items-center gap-2 ${
                  pathName === "/" ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <IoListOutline className="text-xl" />
                <p>View as list</p>
              </Link>
              <Link
                href={"/map/rent"}
                className={`p-4 rounded-full border flex items-center gap-2 ${
                  pathName.startsWith("/map")
                    ? "border-orange-500"
                    : "border-gray-200"
                }`}
              >
                <IoMapOutline className="text-xl" />
                <p>View on map</p>
              </Link>
            </div>
          )}

          {/* 오른쪽: 로그인 / 프로필 */}
          <div className="flex items-center space-x-4 w-[250px] justify-end">
            {session === null ? (
              <>
                <Button
                  variant={"ghost"}
                  size={"lg"}
                  className="text-md text-[#6f6f6f]"
                  onClick={() => openModal("login")}
                >
                  LOGIN
                </Button>
                <span className="text-[#717171] mx-2">|</span>
                <Button
                  variant={"ghost"}
                  size={"lg"}
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

        {/* 검색바: 메인 페이지에만 표시 */}
        {pathName === "/" && (
          <div
            className={`transition-all duration-300 ease-in-out max-w-[800px] ${
              navbarScrolled
                ? "fixed top-6 w-[450px] h-12 mt-0 transform -translate-y-2"
                : "w-full h-16 mt-4"
            } flex items-center justify-between bg-white rounded-full shadow-lg py-4 px-2 border`}
          >
            <input
              type="text"
              placeholder="search"
              className={`w-full pl-6 ${
                navbarScrolled ? "text-sm" : "text-lg"
              } text-gray-700 placeholder-gray-400 focus:outline-none`}
            />
            <Button
              variant={"default"}
              size={"icon"}
              className={`bg-orange-500 text-white rounded-full hover:bg-orange-600 ${
                navbarScrolled ? "p-3" : "p-6"
              }`}
            ></Button>
          </div>
        )}
      </nav>

      {/* 페이지의 나머지 콘텐츠 (헤더 아래) */}
      <div
        className={`${
          pathName === "/" ? "mt-44" : "mt-20"
        } `}
      >{" "}</div>
      <div
        className={`${
          navbarScrolled
            ? "fixed bg-white top-20 z-50 transition-all duration-300"
            : "mt-20 bg-white"
        } w-full`}
      >
        <MainAmenityList />
      </div>
    </header>
  );
};

export default Header;
