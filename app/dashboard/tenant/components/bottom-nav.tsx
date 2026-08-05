"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoListOutline, IoMapOutline } from "react-icons/io5";
import { BsBookmarkStar } from "react-icons/bs";
import { LuUserCircle2 } from "react-icons/lu";

const items = [
  {
    key: "explore",
    label: "explore",
    href: "/list",
    icon: IoListOutline,
    isActive: (p: string) => p === "/list" || p.startsWith("/?"),
  },
  {
    key: "map",
    label: "map",
    href: "/map",
    icon: IoMapOutline,
    isActive: (p: string) => p.startsWith("/map"),
  },
  {
    key: "bookmarks",
    label: "bookmarks",
    href: "/account/unit/favorites",
    icon: BsBookmarkStar,
    isActive: (p: string) => p === "/account/unit/favorites",
  },
  {
    key: "profile",
    label: "profile",
    href: "/account",
    icon: LuUserCircle2,
    isActive: (p: string) =>
      p.startsWith("/account") && p !== "/account/unit/favorites",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 px-2 shadow-xl z-40 justify-between items-center">
      {items.map(({ key, label, href, icon: Icon, isActive }) => (
        <Link
          key={key}
          href={href}
          className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-[10px] font-bold transition-colors ${
            isActive(pathname) ? "text-[#0E5246]" : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
