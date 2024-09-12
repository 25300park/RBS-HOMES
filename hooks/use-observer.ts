import { useRef, useEffect } from "react";

export const useObserver = (callback: () => void, hasMore: boolean, isLoading: boolean) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isLoading) return; // 로딩 중일 때는 실행하지 않음
    if (!hasMore) return; // 더 이상 가져올 데이터가 없으면 실행하지 않음

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
