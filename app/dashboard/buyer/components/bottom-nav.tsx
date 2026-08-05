"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, Calendar, MessageSquare } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard/buyer", icon: Home },
    { key: "saved", label: "Saved", href: "/account/unit/favorites", icon: Heart },
    { key: "visits", label: "Visits", href: "/account/schedule", icon: Calendar },
    { key: "inquiries", label: "Inquiries", href: "/dashboard/buyer/inquiries", icon: MessageSquare },
  ];

  return (
    <nav className="hidden md:flex fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 px-6 shadow-xl z-40 justify-between items-center text-[10px] font-bold text-zinc-600">
      {items.map(({ key, label, href, icon: Icon }) => {
        const isActive =
          key === "dashboard"
            ? pathname === "/dashboard/buyer"
            : pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            className={`flex flex-col items-center space-y-1 ${
              isActive ? "text-[#0E5246]" : "hover:text-zinc-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
