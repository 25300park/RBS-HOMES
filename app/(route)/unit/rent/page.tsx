import ListSearchSection from "../components/list-search-section";
import UnitList from "../components/unit-list";

export interface RentHomeProps {}


const RentHome = async ({}: RentHomeProps) => {
  return (
    <section className="max-w-[1140px] mx-auto">
      Buy 는 페이지네이션 버전, 여긴 무한스크롤 버전
      <ListSearchSection />
      {/* <UnitList/> */}
      <UnitList />
    </section>
  );
};

export default RentHome;
