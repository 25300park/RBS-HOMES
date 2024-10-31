"use client";

import { IoMapOutline, IoListOutline } from "react-icons/io5";
import { LuUserCircle2 } from "react-icons/lu";
import { BsBookmarkStar } from "react-icons/bs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMapStore } from "@/store/use-map-store";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useModalStore } from "@/store/use-modal-store";

export interface MobileFooterNavProps {}

const MobileFooterNav = ({}: MobileFooterNavProps): React.ReactElement | null => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: session, status } = useSession();
  const { sheetPosition } = useMapStore();
  const pathname = usePathname();
  const { openModal } = useModalStore();
  const router = useRouter();
  const hiddenPaths = ["/unit/detail"];
  const shouldRenderFooter = !hiddenPaths.some(path => pathname.startsWith(path));

  const FooterNavList = [
    {
      name: "explore",
      href: "/?sellType=rent",
      isActive: pathname === "/" || pathname.startsWith("/?"),
      icon: (
        <span className="text-2xl">
          <IoListOutline />
        </span>
      ),
    },
    {
      name: "map",
      href: "/map/?sellType=rent",
      isActive: pathname.startsWith("/map"),
      icon: (
        <span className="text-2xl">
          <IoMapOutline />
        </span>
      ),
    },
    {
      name: "bookmarks",
      href: "/account/unit/favorites",
      isActive: pathname === "/account/unit/favorites",
      icon: (
        <span className="text-2xl">
          <BsBookmarkStar />
        </span>
      ),
      requiresAuth: true,
    },
    {
      name: "profile",
      href: "/account",
      isActive: pathname.startsWith("/account") && pathname !== "/account/unit/favorites",
      icon: (
        <span className="text-2xl">
          <LuUserCircle2 />
        </span>
      ),
    },
  ];


  if (!shouldRenderFooter) return null; 

  if (!isMobile) return null;

  const isMapPage = pathname === "/map";
  const shouldHideFooter = isMapPage && sheetPosition !== "full";

  const handleNavClick = (item: typeof FooterNavList[0]) => (e: React.MouseEvent) => {
    if (item.requiresAuth && !session) {
      e.preventDefault();
      openModal("login");
      return;
    }
  };

  return (
    <nav
      className={`w-full h-16 fixed bottom-0 z-50 bg-white border-t transition-transform duration-300 ${
        shouldHideFooter ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <ul className="flex justify-around items-center h-full">
        {FooterNavList.map((item) => (
          <Link href={item.href} key={item.name} onClick={handleNavClick(item)}>
            <li
              className={`flex flex-col items-center text-xs gap-1
                ${item.isActive ? "text-orange-400" : "text-gray-500"}`}
            >
              {item.icon}
              <p>{item.name}</p>
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  );
};

export default MobileFooterNav;