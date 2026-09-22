"use client";

import { useState } from "react";
import ApproveCareButton from "@/app/dashboard/landlord/components/approve-care-button";

interface StaffReviewDecisionFormProps {
  careId: number;
}

export default function StaffReviewDecisionForm({ careId }: StaffReviewDecisionFormProps) {
  const [staffReviewNote, setStaffReviewNote] = useState("");
  const [decided, setDecided] = useState(false);

  return (
    <div className="space-y-2">
      <textarea
        value={staffReviewNote}
        onChange={(e) => setStaffReviewNote(e.target.value)}
        disabled={decided}
        placeholder="Review note (optional to approve, required to reject)..."
        rows={2}
        className="w-full text-xs p-2 rounded-lg border border-zinc-200 outline-none focus:border-blue-500 transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
      />
      <div className="flex items-center gap-2 justify-end">
        <ApproveCareButton
          careId={careId}
          targetStatus="AWAITING_TENANT_CONFIRMATION"
          label="Reject"
          doneLabel="Rejected"
          extraBody={{ staffReviewNote: staffReviewNote.trim() || undefined }}
          onSuccess={() => setDecided(true)}
          variant="danger"
        />
        <ApproveCareButton
          careId={careId}
          targetStatus="COMPLETED"
          label="Approve & Complete"
          doneLabel="Completed"
          extraBody={{ staffReviewNote: staffReviewNote.trim() || undefined }}
          onSuccess={() => setDecided(true)}
        />
      </div>
    </div>
  );
}
