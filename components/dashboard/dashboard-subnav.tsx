"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Building2,
  Wrench,
  FileText,
  Truck,
} from "lucide-react";

interface DashboardSubnavProps {
  role?: "tenant" | "landlord" | "staff" | "agent";
}

export function DashboardSubnav({ role = "tenant" }: DashboardSubnavProps) {
  const pathname = usePathname();

  const tenantLinks = [
    { label: "Overview", href: "/dashboard/tenant", icon: LayoutDashboard },
    { label: "Payment History", href: "/dashboard/tenant/payments", icon: CreditCard },
    { label: "Care & Repair", href: "/dashboard/tenant/care", icon: Wrench },
    { label: "Contracts & LOI Vault", href: "/dashboard/contracts", icon: FileText },
  ];

  const landlordLinks = [
    { label: "Overview", href: "/dashboard/landlord", icon: LayoutDashboard },
    { label: "Revenue & Ledger", href: "/dashboard/landlord/payments", icon: CreditCard },
    { label: "Contracts & LOI Vault", href: "/dashboard/contracts", icon: FileText },
  ];

  const links = role === "landlord" ? landlordLinks : tenantLinks;

  return (
    <div className="hidden md:flex items-center justify-between bg-white border border-zinc-200/80 rounded-2xl p-2 shadow-sm mb-6">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-zinc-600 hover:text-blue-600 hover:bg-zinc-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-zinc-400 group-hover:text-blue-600"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="text-[11px] font-semibold text-zinc-400 pr-3">
        {role === "tenant" ? "Resident Portal Navigation" : "Owner Asset Navigation"}
      </div>
    </div>
  );
}
