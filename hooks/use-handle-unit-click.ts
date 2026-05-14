import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { generatePropertySlug } from '@/lib/utils';

// ✅ unit 정보 타입 정의
interface UnitClickProps {
  id: number
  sellType?: string | null
  type?: string | null
  address2?: string | null
  title?: string | null
}

const useHandleUnitClick = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleUnitClick = useCallback((unit: UnitClickProps) => {
    // ✅ 슬러그 생성
    const slug = generatePropertySlug(unit)
    const url = `/properties/${slug}`

    if (isMobile) {
      router.push(url);
    } else {
      window.open(url, '_blank');
    }
  }, [router, isMobile]);

  return handleUnitClick;
};

export default useHandleUnitClick;