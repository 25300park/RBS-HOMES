"use client";

import { IoMapOutline, IoListOutline, IoSearch } from "react-icons/io5";
import { LuUserCircle2 } from "react-icons/lu";
import { BsBookmarkStar } from "react-icons/bs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useMapStore } from "@/store/use-map-store";
import { usePathname } from "next/navigation";
import Link from "next/link";

export interface MobileFooterNavProps {}

const FooterNavList = [
  {
    name: "explore",
    href: "/?sellType=rent",
    isActive: false,
    icon: (
      <span className="text-2xl">
        <IoListOutline />
      </span>
    ),
  },
  {
    name: "map",
    href: "/map/?sellType=rent",
    isActive: false,
    icon: (
      <span className="text-2xl">
        <IoMapOutline />
      </span>
    ),
  },
  {
    name: "bookmarks",
    href: "/account/unit/favorites",
    isActive: false,
    icon: (
      <span className="text-2xl">
        <BsBookmarkStar />
      </span>
    ),
  },
  {
    name: "profile",
    href: "/account",
    isActive: false,
    icon: (
      <span className="text-2xl">
        <LuUserCircle2 />
      </span>
    ),
  },
];

const MobileFooterNav =
  ({}: MobileFooterNavProps): React.ReactElement | null => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const { sheetPosition } = useMapStore();
    const pathname = usePathname();

    if (!isMobile) return null;

    const isMapPage = pathname === "/map";
    const shouldHideFooter = isMapPage && sheetPosition !== "full";

    return (
      <nav
        className={`w-full h-16 fixed bottom-0 z-50 bg-white border-t transition-transform duration-300 ${
          shouldHideFooter ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <ul className="flex justify-around items-center h-full">
          {FooterNavList.map((item) => (
            <Link href={item.href} key={item.name}>
              <li
                key={item.name}
                className={`flex flex-col items-center text-xs text-gray-500 gap-1`}
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
