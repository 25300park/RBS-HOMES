"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendComplainForm } from "@/lib/action";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const ComplainModal = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherText, setOtherText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitId, setUnitId] = useState<number | null>(null);

  const { data: session } = useSession();
  const pathname = usePathname();

  // Extract unitId from URL
  useEffect(() => {
    if (pathname) {
      const matches = pathname.match(/\/unit\/detail\/(\d+)/);
      if (matches && matches[1]) {
        setUnitId(parseInt(matches[1]));
      }
    }
  }, [pathname]);

  const options = [
    "Home is no longer available",
    "Incorrect information/photos",
    "Fraudulent listing or spam",
    "Discriminatory or offensive listing",
    "Other",
  ];

  const handleSubmit = async () => {
    if (!session?.user) {
      toast({
        title: "Login Required",
        description: "Please log in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    if (!unitId) {
      toast({
        title: "Error",
        description: "Unit information not found.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedReason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting.",
        variant: "destructive",
      });
      return;
    }

    const reportValue = selectedReason === "Other" ? otherText : selectedReason;

    if (selectedReason === "Other" && !otherText.trim()) {
      toast({
        title: "Error",
        description: "Please describe the issue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("unitId", unitId.toString());
      formData.append("message", reportValue);

      // Call server action
      const response = await sendComplainForm(formData);

      if (response.success) {
        toast({ description: response.message });
        setTimeout(() => onClose(), 1000);
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "An error occurred while submitting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-bold text-center">Report a Problem</h2>

      <div className="space-y-3">
        <p className="text-sm font-medium">What&apos;s the issue?</p>
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
        disabled={isSubmitting}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
      >
        {isSubmitting ? "Processing..." : "Continue"}
      </Button>
    </div>
  );
};

export default ComplainModal;
