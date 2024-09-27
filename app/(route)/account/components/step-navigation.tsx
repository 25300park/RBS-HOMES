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

    const currentPath = stepRoute.findIndex((route) =>
      pathname.includes(route)
    );
    if (currentPath !== -1) {
      setCurrentStep(currentPath);
    }
  }, [pathname]);

  const handleStepClick = (stepIndex: number) => {
    // 현재 스텝보다 큰 스텝을 클릭했을 경우
    if (stepIndex > currentStep && !completedSteps.includes(stepIndex - 1)) {
      // 이전 스텝이 완료되지 않았을 경우
      toast({
        variant: "destructive",
        title: "Incomplete Step",
        description: "You need to complete the previous step first.",
      });
    } else {
      // 올바른 조건일 경우 경로 변경
      const newRoute = `/account/unit/registration/${stepRoute[stepIndex]}`;
      router.push(newRoute);
    }
  };

  return (
    <div className="flex  justify-center my-10">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            onClick={() => handleStepClick(index)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <button
              className={`relative h-10 w-10 rounded-md font-medium text-md flex items-center justify-center
            ${
              completedSteps.includes(index)
                ? "bg-orange-400 text-white shadow-md shadow-orange-200"
                : "bg-gray-200 text-gray-600"
            }
          `}
            >
              {completedSteps.includes(index) ? (
                <div>
                  <FaCheck />
                </div>
              ) : (
                index + 1
              )}
              {/* {completedSteps.includes(index) && (
              <FaCheckCircle className="absolute -top-2 -right-2 text-green-500" />
            )} */}
            </button>
            <div
              className={`
                hover:text-orange-500
                ${
                  index === currentStep
                    ? "text-orange-500" // 완료된 스텝의 라인은 주황색
                    : "text-gray-300" // 나머지 스텝은 회색 라인
                }`}
            >
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-10 h-[2px] mx-2 ${
                completedSteps.includes(index)
                  ? "bg-orange-500" // 완료된 스텝의 라인은 주황색
                  : "bg-gray-300" // 나머지 스텝은 회색 라인
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
