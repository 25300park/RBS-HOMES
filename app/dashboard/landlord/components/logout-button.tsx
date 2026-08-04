"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center space-x-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-200 transition-all"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Logout</span>
    </button>
  );
}
