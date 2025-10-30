// components/GoogleReviews.tsx
import { Star, MapPin, Phone, Globe, Clock } from 'lucide-react';
import { getGoogleReviews } from '@/lib/action';

export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  console.log(data)

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto mt-24 p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">리뷰를 불러올 수 없습니다. 환경변수를 확인하세요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-24">
123
    </div>
  );
}