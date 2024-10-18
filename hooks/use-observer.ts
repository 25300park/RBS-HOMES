import { useRef, useEffect } from "react";

export const useObserver = (callback: () => void, hasMore: boolean, isLoading: boolean) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading || !hasMore) return; // 로딩 중이거나 더 이상 데이터가 없을 때 중단

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
      }
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [callback, hasMore, isLoading]);

  return { lastElementRef: observerRef };
};
