"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, Wrench, MessageSquare, User } from "lucide-react";

interface BottomNavProps {
  communityHref: string;
}

export default function BottomNav({ communityHref }: BottomNavProps) {
  const pathname = usePathname();

  const items = [
    { key: "home", label: "Home", href: "/dashboard/tenant", icon: Home },
    { key: "payments", label: "Payments", href: "/dashboard/tenant#payments", icon: Wallet },
    { key: "care", label: "Care", href: "/dashboard/tenant/care", icon: Wrench },
    { key: "community", label: "Community", href: communityHref, icon: MessageSquare },
    { key: "profile", label: "Profile", href: "/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 px-2 shadow-xl z-40 flex justify-between items-center">
      {items.map(({ key, label, href, icon: Icon }) => {
        const path = href.split("?")[0].split("#")[0];
        const isActive =
          key === "home"
            ? pathname === "/dashboard/tenant"
            : pathname.startsWith(path) && path !== "/dashboard/tenant";
        return (
          <Link
            key={key}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 min-h-[56px] py-2 text-[10px] font-bold transition-colors ${
              isActive ? "text-[#0E5246]" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
