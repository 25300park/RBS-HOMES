"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ComplainModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherText, setOtherText] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedReason) return;
    const reportValue = selectedReason === "Other" ? otherText : selectedReason;
    console.log("Reported reason:", reportValue);
    onClose();
  };

  const options = [
    "Home is no longer available",
    "Incorrect information/photos",
    "Fraudulent listing or spam",
    "Discriminatory or offensive listing",
    "Other"
  ];

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-center">Report a Problem</h2>

      <div className="space-y-3">
        <p className="text-sm font-medium">What's the issue?</p>
        {options.map((option) => (
          <div
            key={option}
            onClick={() => setSelectedReason(option)}
            className={cn(
              "flex items-center space-x-2 cursor-pointer p-2 rounded border",
              selectedReason === option
                ? "border-orange-500 bg-orange-100"
                : "border-gray-300"
            )}
          >
            <div
              className={cn(
                "w-4 h-4 rounded-full border-2",
                selectedReason === option
                  ? "border-orange-500 bg-orange-500"
                  : "border-gray-400"
              )}
            ></div>
            <span className="text-sm">{option}</span>
          </div>
        ))}

        {selectedReason === "Other" && (
          <Textarea
            placeholder="Please describe the issue"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            className="min-h-[100px] border-gray-300"
          />
        )}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        Continue
      </Button>
    </div>
  );
};

export default ComplainModal;