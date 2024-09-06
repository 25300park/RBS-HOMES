import BannerGroup from "./components/banner-group";
import MainList from "./components/main-list-section";
import ServiceSection from "./components/service-section";

const DashBoard = () => {
  return (
    <>
      <div className="">
        <BannerGroup />
        <MainList />
        <ServiceSection />
      </div>
    </>
  );
};

export default DashBoard;
