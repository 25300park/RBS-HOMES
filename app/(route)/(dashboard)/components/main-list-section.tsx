import PropertyCard from "@/components/ui/property-card";
import { getMainUnitList } from "../action";
import { Unit } from "@prisma/client";
import { Units } from "@/mock/data";

export interface MainListProps {}

const MainList = async ({}: MainListProps) => {
  // const { units } = await getMainUnitList();
  const formattedUnits: Unit[] = Units.map((unit: any) => ({
    ...unit,
    outstanding_payment: unit.outstanding_payment
      ? parseFloat(unit.outstanding_payment.toString())
      : null,
    price: unit.price ? parseFloat(unit.price.toString()) : null,
  }));
  return (
    <section className="max-w-[1140px] mx-auto py-12">
      <div>
        <h3>Recomment For you</h3>
        <h4>Listings we think you’ll love.</h4>
      </div>
      <div className="grid grid-cols-4 gap-8">
        {formattedUnits.length === 0 ? (
          <div>no result</div>
        ) : (
          <>
            {formattedUnits.map((card, index) => (
              <PropertyCard
                key={index}
                title={card.title}
                price={Number(card.price)}
                area={card.area}
                location={card.address2 as string}
                imageUrl={"/next.svg"}
                postedDate={"2days ago"}
                isVip={true}
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default MainList;
