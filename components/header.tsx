"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

// 세션 종료
export interface HeaderProps {}
const NavLinks = [
  { title: "rent", href: "/rent" },
  { title: "buy", href: "/buy" },
  // { title: "rent", href: "/rent" },
  { title: "sell", href: "/sell", auth: true },
  { title: "map", href: "/map" },
];

const Header = ({}: HeaderProps): React.ReactNode => {
  const { openModal } = useModalStore();
  const { data: session, status } = useSession();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
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
    <header className="h-20">
      <nav
        className={`fixed top-0 w-full transition-all duration-300 bg-white ${
          navbarScrolled
            ? "h-16 shadow-lg"
            : "h-20 bg-transparent"
        } z-50 w-full  flex items-center px-8 mx-auto justify-between`}
      >
        <div className="flex items-center">
          <Link className="mr-16" href={"/"}> 로고 </Link>

          {NavLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Button
                variant={"ghost"}
                size={"lg"}
                className="text-md text-[#6f6f6f]"
              >
                {link.title.toUpperCase()}
              </Button>
            </Link>
          ))}
        </div>
        <div>
          {status === "loading" ? (
            <div>로딩</div>
          ) : status === "unauthenticated" ? (
            <>
              <Button
                variant={"ghost"}
                size={"lg"}
                className="text-md text-[#6f6f6f]"
                onClick={() => openModal("login")}
              >
                LOGIN
              </Button>
              <span className="text-zinc-200">|</span>
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
              <Button
                variant={"ghost"}
                size={"lg"}
                className="text-md text-[#6f6f6f]"
                onClick={() => {}}
              >
                MY PAGE
              </Button>
              <span className="text-zinc-200 mx-3">|</span>
              <Button
                variant={"ghost"}
                size={"lg"}
                className="text-md text-[#6f6f6f]"
                onClick={() => signOut()}
              >
                LOGOUT
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
