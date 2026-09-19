import ListSearchSection from "../components/list-search-section";
import UnitList from "../components/unit-list";

export interface RentHomeProps {}


const RentHome = async ({}: RentHomeProps) => {
  return (
    <section className="max-w-[1140px] mx-auto">
      <ListSearchSection />
      <UnitList />
    </section>
  );
};

export default RentHome;
