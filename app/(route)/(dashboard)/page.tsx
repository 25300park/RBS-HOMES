import BannerGroup from "./components/banner-group";
import CityGrid from "./components/city-grid";
import MainList from "./components/main-list-section";
import ServiceSection from "./components/service-section";

const DashBoard = () => {
  return (
    <>
      <div className="">
        <BannerGroup />
        <MainList />
        <CityGrid />
        <ServiceSection />
      </div>
    </>
  );
};

export default DashBoard;
