import PropertyCard from "@/components/ui/property-card";
import { getMainUnitList } from "../action";
import Link from "next/link";

// 시간 차이를 계산해 상대적인 시간으로 변환하는 함수
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
};

export interface MainListProps {}

const MainList = async ({}: MainListProps) => {
  const { units }: any = await getMainUnitList();
  return (
    <section className="max-w-[1140px] mx-auto py-12">
      <div className="grid grid-cols-4 gap-8 relative z-10">
        {units.length === 0 ? (
          <div>No result</div>
        ) : (
          <>
            {units.map((card: any, index: number) => (
              <Link href={`/unit/detail/${card.id}`} key={index}>
                <PropertyCard
                  title={card.title}
                  price={Number(card.price)}
                  sellType={card.sellType}
                  area={card.area}
                  location={`${card.address2 as string},${
                    card.address3 as string
                  },${card.address4 as string}`}
                  imageUrl={JSON.parse(card.images)[0]}
                  postedDate={getRelativeTime(card.lastUpdate)} // 마지막 업데이트 시간 기반으로 상대 시간 계산
                  isVip={true}
                  bed={card.bed as number}
                  bath={card.bath as number}
                />
              </Link>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default MainList;
