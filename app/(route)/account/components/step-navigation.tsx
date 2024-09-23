"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";

const steps = ["step-one", "step-two", "step-three", "review"];
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
    <div className="flex justify-center space-x-4 mb-6 ">
      {steps.map((step, index) => (
        <button
          key={index}
          onClick={() => handleStepClick(index)}
          className={`relative py-2 px-6 rounded-full font-medium text-sm 
            ${
              index === currentStep
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600"
            }
            transition duration-300 ease-in-out transform hover:scale-105
          `}
        >
          {step}
          {completedSteps.includes(index) && (
            <FaCheckCircle className="absolute -top-2 -right-2 text-green-500" />
          )}
        </button>
      ))}
    </div>
  );
}
