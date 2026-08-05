"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Bell, Building2, FileText } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { key: "dashboard", label: "Dashboard", href: "/dashboard/agent", icon: Home },
    { key: "action", label: "Action", href: "/dashboard/agent/tour-requests", icon: Bell },
    { key: "listings", label: "Listings", href: "/account/unit/my-list", icon: Building2 },
    { key: "pipeline", label: "Pipeline", href: "/account/schedule", icon: FileText },
  ];

  return (
    <nav className="hidden md:flex fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 py-2.5 px-6 shadow-xl z-40 justify-between items-center text-[10px] font-bold text-zinc-600">
      {items.map(({ key, label, href, icon: Icon }) => {
        const isActive =
          key === "dashboard"
            ? pathname === "/dashboard/agent"
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
