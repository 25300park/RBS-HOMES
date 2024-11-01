import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';

const useHandleUnitClick = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleUnitClick = useCallback((unitId: number) => {
    if (isMobile) {
      router.push(`/unit/detail/${unitId}`);
    } else {
      window.open(`/unit/detail/${unitId}`, '_blank');
    }
  }, [router, isMobile]);

  return handleUnitClick;
};

export default useHandleUnitClick;