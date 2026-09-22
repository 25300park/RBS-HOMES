"use client";

import { useState } from "react";
import ApproveCareButton from "@/app/dashboard/landlord/components/approve-care-button";

interface StaffEscalateCareFormProps {
  careId: number;
}

export default function StaffEscalateCareForm({ careId }: StaffEscalateCareFormProps) {
  const [staffMemo, setStaffMemo] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-2">
      <textarea
        value={staffMemo}
        onChange={(e) => setStaffMemo(e.target.value)}
        disabled={submitted}
        placeholder="Vendor sourcing memo (internal — not shown to tenant or owner)..."
        rows={2}
        className="w-full text-xs p-2 rounded-lg border border-zinc-200 outline-none focus:border-blue-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
      />
      <ApproveCareButton
        careId={careId}
        targetStatus="PENDING_OWNER_APPROVAL"
        label="Request Owner Approval"
        doneLabel="Sent to Owner"
        extraBody={{ staffMemo: staffMemo.trim() || undefined }}
        onSuccess={() => setSubmitted(true)}
      />
    </div>
  );
}
