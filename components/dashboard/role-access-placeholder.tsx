"use client";

import Link from "next/link";
import { ArrowLeft, PlusCircle, Building2, Home, Briefcase, ShieldCheck } from "lucide-react";

interface RoleAccessPlaceholderProps {
  targetRole: "owner" | "tenant" | "agent" | "buyer" | "staff";
  userRoleName: string;
  activeDashboardUrl: string;
}

const ROLE_INFO = {
  staff: {
    badge: "Mr. Homes Operations Portal",
    title: "Mr. Homes Staff Access Restricted",
    subtitle: "This portal is restricted to authorized Mr. Homes coordinators and operations staff.",
    description: "The Staff Operations Dashboard is exclusive to Mr. Homes property managers coordinating tenant care requests, gatepass clearances, and owner authorizations.",
    primaryAction: {
      label: "Return to My Dashboard",
      href: "/dashboard/tenant",
      icon: Home,
    },
    icon: ShieldCheck,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
  },
  owner: {
    badge: "Property Owner & Landlord Portal",
    title: "No Property Owner Profile Found",
    subtitle: "Your account is not registered as a property owner or landlord.",
    description: "This portal is reserved for landlords managing rental units, lease contracts, and tenant payments. If you own property in the Philippines, you can register your unit to activate owner features.",
    primaryAction: {
      label: "Register Property / List Unit",
      href: "/account/unit/registration/step-one",
      icon: PlusCircle,
    },
    icon: Building2,
    iconBg: "bg-blue-50 text-blue-600 border-blue-200",
  },
  tenant: {
    badge: "Verified Tenant Portal",
    title: "No Active Residential Lease",
    subtitle: "You do not have an active rental contract registered under this account.",
    description: "The Tenant Dashboard provides monthly rent tracking, maintenance requests, and building notices for verified residents. Once your lease contract is finalized, your tenant portal will automatically activate.",
    primaryAction: {
      label: "Browse Rental Properties",
      href: "/list?type=condo",
      icon: Home,
    },
    icon: Home,
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  agent: {
    badge: "Agent & Broker Portal",
    title: "Agent Accreditation Required",
    subtitle: "This portal is restricted to accredited agents and licensed brokers.",
    description: "The Agent Management Dashboard is exclusive to verified RBS Homes brokers managing client property listings, scheduled tours, and buyer inquiries.",
    primaryAction: {
      label: "Browse Properties",
      href: "/list",
      icon: Briefcase,
    },
    icon: Briefcase,
    iconBg: "bg-purple-50 text-purple-600 border-purple-200",
  },
  buyer: {
    badge: "Buyer & Inquirer Portal",
    title: "No Active Property Inquiries",
    subtitle: "Your buyer inquiry and saved properties list is currently empty.",
    description: "Track your property viewings, submitted offers, and saved favorite condos across Metro Manila.",
    primaryAction: {
      label: "Search Properties for Sale",
      href: "/list?sellType=Sale",
      icon: Building2,
    },
    icon: Building2,
    iconBg: "bg-amber-50 text-amber-600 border-amber-200",
  },
};

export default function RoleAccessPlaceholder({
  targetRole,
  userRoleName,
  activeDashboardUrl,
}: RoleAccessPlaceholderProps) {
  const config = ROLE_INFO[targetRole] || ROLE_INFO.owner;
  const MainIcon = config.icon;
  const ActionIcon = config.primaryAction.icon;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-zinc-200/90 text-center space-y-6">
        
        {/* Top Icon & Badge */}
        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${config.iconBg} shadow-sm`}>
            <MainIcon className="w-8 h-8 stroke-[1.8]" />
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 uppercase tracking-wider">
            {config.badge}
          </span>
        </div>

        {/* Title & Explanations */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {config.title}
          </h2>
          <p className="text-sm font-bold text-zinc-600">
            {config.subtitle}
          </p>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed pt-1">
            {config.description}
          </p>
        </div>

        {/* Current Role Notice Box */}
        <div className="bg-[#f8fafc] border border-zinc-200/80 rounded-2xl p-4 max-w-lg mx-auto flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-[11px] font-bold text-zinc-400 block">Your Current Active Role:</span>
            <span className="font-extrabold text-zinc-800 text-sm">{userRoleName}</span>
          </div>
          <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            Active Profile
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={activeDashboardUrl}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-all active:scale-98"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Switch to {userRoleName} Dashboard</span>
          </Link>

          <Link
            href={config.primaryAction.href}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-extrabold px-6 py-3 rounded-xl border border-zinc-200 shadow-2xs transition-all"
          >
            <ActionIcon className="w-4 h-4 text-zinc-500" />
            <span>{config.primaryAction.label}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
