"use client";

import { useState } from "react";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { promoteToStaff } from "../actions";

export interface PromotableUser {
  id: number;
  name: string | null;
  email: string | null;
  level: number;
}

interface Props {
  candidates: PromotableUser[];
}

const LEVEL_LABEL: Record<number, string> = {
  2: "Agent",
  3: "Broker",
};

export default function StaffManagement({ candidates }: Props) {
  const { toast } = useToast();
  const [items, setItems] = useState(candidates);
  const [promotingId, setPromotingId] = useState<number | null>(null);

  const handlePromote = async (userId: number) => {
    setPromotingId(userId);
    try {
      const result = await promoteToStaff(userId);
      if (!result.success) {
        toast({
          title: "Promotion Failed",
          description: result.message,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Promoted", description: result.message });
      setItems((prev) => prev.filter((u) => u.id !== userId));
    } catch {
      toast({
        title: "Promotion Failed",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-zinc-200/80 overflow-hidden font-sans">
      <div className="p-5 sm:p-6 border-b border-zinc-100 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-black text-zinc-900">Staff Management</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Super Admin only — promote an Agent or Broker account to Staff (level 0)
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-8 text-center text-sm text-zinc-400">
          No Agent/Broker accounts available to promote.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600">
            <thead className="bg-zinc-50/80 text-[11px] font-extrabold uppercase text-zinc-400 tracking-wider border-b border-zinc-100">
              <tr>
                <th className="py-3.5 px-6 sm:px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-6 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-red-50/20 transition-colors">
                  <td className="py-4 px-6 sm:px-4 font-extrabold text-zinc-900">
                    {u.name || "(no name)"}
                  </td>
                  <td className="py-4 px-4">{u.email}</td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                      {LEVEL_LABEL[u.level] ?? u.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 sm:px-4 text-right">
                    <button
                      type="button"
                      disabled={promotingId === u.id}
                      onClick={() => handlePromote(u.id)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>{promotingId === u.id ? "Promoting…" : "Promote to Staff"}</span>
                      {promotingId !== u.id && <ArrowUpRight className="w-3.5 h-3.5" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
