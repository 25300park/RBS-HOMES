'use client'

import { useState, useCallback } from "react";

// 로딩 상태 관리 훅
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return { isLoading, startLoading, stopLoading };
};
