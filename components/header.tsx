"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useRouter, usePathname } from "next/navigation";
import HeaderUserProfile from "./ui/header-user-profile";

// 세션 종료
export interface HeaderProps {
  session: any;
}

const NavLinks = [
  { title: "rent", href: "/map/rent" },
  { title: "buy", href: "/map/sale" },
  { title: "sell", href: "/sell", auth: true },
];

const Header = ({ session }: HeaderProps): React.ReactNode => {
  const { openModal } = useModalStore();
  const pathName = usePathname();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter(); // useRouter 사용
  useEffect(() => {
    const handleScroll = () => {
      // 스크롤 위치에 따라 네브바 색상 변경
      if (window.scrollY > 50) {
        setNavbarScrolled(true);
      } else {
        setNavbarScrolled(false);
      }

      // 스크롤 위치에 따라 이미지 이동 효과 (parallax)
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="h-20 ">
      <nav
        className={`fixed top-0 w-full transition-all duration-300 border-b bg-white ${
          navbarScrolled ? "h-16 shadow-lg bg-white" : "h-20 bg-transparent"
        } z-50 w-full flex items-center px-8 mx-auto justify-between`}
      >
        <div className="flex items-center">
          <Link className="mr-16" href={"/"}>
            <img src="/assets/images/RBS_logo.png" alt="logo" />
          </Link>

          {NavLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Button
                variant={"ghost"}
                size={"lg"}
                // 링크가 활성화되면 주황색 배경 추가
                className={`text-md text-[#6f6f6f] ${
                  pathName === link.href ? "bg-orange-500 text-white" : ""
                }`}
              >
                {link.title.toUpperCase()}
              </Button>
            </Link>
          ))}
        </div>
        <div>
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
              <span className="text-[#717171]">|</span>
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
            <>
              {/* <Link href={"/account"}>
                <Button
                  variant={"ghost"}
                  size={"lg"}
                  className="text-md text-[#6f6f6f]"
                  onClick={() => {}}
                >
                  MY ACCOUNT
                </Button>
              </Link>
              <span className="text-[#717171] mx-3">|</span>
              <Button
                variant={"ghost"}
                size={"lg"}
                className="text-md text-[#6f6f6f]"
                onClick={() => signOut()}
              >
                LOGOUT
              </Button> */}
              <HeaderUserProfile session={session}/>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

