import { useState, useEffect } from "react";

interface UseCooldownProps {
  cooldownTime?: number;
  onCooldownEnd?: () => void;
}

export function useCooldown({ cooldownTime = 60, onCooldownEnd }: UseCooldownProps = {}) {
  const [isInCooldown, setIsInCooldown] = useState(false);
  const [timer, setTimer] = useState(cooldownTime);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isInCooldown) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsInCooldown(false);
            onCooldownEnd?.();
            return cooldownTime;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isInCooldown, cooldownTime, onCooldownEnd]);

  const startCooldown = () => {
    setIsInCooldown(true);
    setTimer(cooldownTime);
  };

  const resetCooldown = () => {
    setIsInCooldown(false);
    setTimer(cooldownTime);
  };

  return {
    isInCooldown,
    timer,
    startCooldown,
    resetCooldown,
  };
}