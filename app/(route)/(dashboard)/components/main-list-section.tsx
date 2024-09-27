import PropertyCard from "@/components/ui/property-card";
import { getMainUnitList } from "../action";
import Link from "next/link";

export interface MainListProps {}

const MainList = async ({}: MainListProps) => {
  const { units }: any = await getMainUnitList();
  return (
    <section className="max-w-[1140px] mx-auto py-12">
      <div>
        <h3>Recomment For you 메인화면 디자인민 컨텐츠 정리, 광고 유무체크</h3>
        <h4>Listings we think you’ll love.</h4>
      </div>
      <div className="grid grid-cols-4 gap-8">
        {units.length === 0 ? (
          <div>no result</div>
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
                  imageUrl={"/next.svg"}
                  postedDate={"2 days ago"}
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
