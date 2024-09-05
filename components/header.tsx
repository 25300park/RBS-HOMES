"use client";

import Link from "next/link";
import { useModalStore } from "@/store/use-modal-store";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export interface HeaderProps {}
const NavLinks = [
  { title: "rent", href: "/rent" },
  { title: "buy", href: "/buy" },
  // { title: "rent", href: "/rent" },
  // { title: "rent", href: "/rent" },
  { title: "sell", href: "/sell", auth: true },
];

const Header = ({}: HeaderProps): React.ReactNode => {
  const { openModal } = useModalStore();
  const { data: session, status } = useSession();
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  console.log(session, status);
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
    <header className="h-16">
      <nav
        className={`fixed top-0 w-full transition-all duration-300 ${
          navbarScrolled
            ? "bg-white/10 backdrop-blur-sm shadow-lg"
            : "bg-transparent"
        } z-50 w-full h-24 flex items-center px-8 mx-auto justify-between`}
      >
        <div className="flex items-center">
          <div className="mr-16"> 로고 </div>

          {NavLinks.map((link) => (
            <Link key={link.title} href={link.href}>
              <Button variant={"ghost"}>{link.title.toUpperCase()}</Button>
            </Link>
          ))}
        </div>
        <div>
          {status === "unauthenticated" ? (
            <>
              <Button variant={"ghost"} onClick={() => openModal("login")}>
                LOGIN
              </Button>
              <span className="text-zinc-200">|</span>
              <Button variant={"ghost"} onClick={() => openModal("signup")}>
                SIGN-UP
              </Button>
            </>
          ) : (
            <>
              <Button variant={"ghost"} onClick={() => {}}>
                MY PAGE
              </Button>
              <span className="text-zinc-200 mx-3">|</span>
              <Button variant={"ghost"} onClick={() => signOut()}>
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
