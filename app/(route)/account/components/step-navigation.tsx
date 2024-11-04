"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const steps = ["Basic Info", "Detail", "Images", "Review"];
const stepRoute = ["step-one", "step-two", "step-three", "review"];

export default function StepNavigation() {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const completed = stepRoute.reduce<number[]>((acc, _, index) => {
      const data = localStorage.getItem(`step${index + 1}`);
      if (data && data.trim() !== "") {
        acc.push(index);
      }
      return acc;
    }, []);
    setCompletedSteps(completed);

    const currentPath = stepRoute.findIndex((route) => pathname.includes(route));
    if (currentPath !== -1) {
      setCurrentStep(currentPath);
    }
  }, [pathname]);

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex > currentStep && !completedSteps.includes(stepIndex - 1)) {
      toast({
        variant: "destructive",
        title: "Incomplete Step",
        description: "You need to complete the previous step first.",
      });
    } else {
      const newRoute = `/account/unit/registration/${stepRoute[stepIndex]}`;
      router.push(newRoute);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Mobile Current Step Label */}
      <div className="hidden md:block bg-white border-b text-center py-2 px-4 text-sm font-medium text-orange-500">
        {steps[currentStep]}
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-center py-10 md:py-6">
        <div className="flex items-center max-w-3xl w-full px-6 md:px-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div
                onClick={() => handleStepClick(index)}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <button
                  className={`relative h-10 w-10 md:h-8 md:w-8 rounded-full font-medium text-base md:text-sm 
                    flex items-center justify-center transition-colors
                    ${
                      completedSteps.includes(index)
                        ? "bg-orange-400 text-white shadow-md shadow-orange-200"
                        : "bg-zinc-100 text-zinc-600"
                    }
                    ${index === currentStep ? "ring-2 ring-orange-300" : ""}
                  `}
                >
                  {completedSteps.includes(index) ? (
                    <div>
                      <FaCheck className="md:text-xs" />
                    </div>
                  ) : (
                    index + 1
                  )}
                </button>
                <div
                  className={`
                    md:hidden
                    group-hover:text-orange-500 transition-colors
                    ${
                      index === currentStep
                        ? "text-orange-500 font-medium"
                        : "text-gray-500"
                    }`}
                >
                  {step}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-[2px] w-full transition-colors
                      ${
                        completedSteps.includes(index)
                          ? "bg-orange-500"
                          : "bg-gray-300"
                      }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}