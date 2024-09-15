import { getUnitsWithAdmin } from "../action";
import ListSearchSection from "../components/list-search-section";
import UnitList from "../components/unit-list";
import UnitListPagination from "../components/unit-list-pagination";

export interface BuyHomeProps {}


const BuyHome = async ({}: BuyHomeProps) => {
  // const units = await getUnitsWithAdmin();
  return (
    <section className="max-w-[1140px] mx-auto">
      <ListSearchSection />
      {/* <UnitList/> */}
      <UnitListPagination />

    </section>
  );
};

export default BuyHome;


// {
//   id: 1,
//   title: 'Sample Unit 11',
//   type: 'Condominium',
//   sellType: 'Sale',
//   fullAddress: 'Unit 1809, Eastwood City, Manila, 1010',
//   address2: 'Manila',
//   address3: 'Eastwood City',
//   area: 60,
//   price: 40835.14,
//   ownerName: 'Owner 11',
//   images: [
//     'https://example.com/qc-1.jpg',
//     'https://example.com/qc-2.jpg',
//     'https://example.com/qc-3.jpg',
//     'https://example.com/qc-4.jpg'
//   ],
//   bed: 4,
//   bath: 2,
//   parking: 0,
//   note: 'Located near shopping centers.',
//   admin: {
//     id: 1,
//     username: null,
//     email: 'sper6904@gmail.com',
//     image: 'https://lh3.googleusercontent.com/a/ACg8ocIijI9nANUY2UFSf0tR0UhGKyommkpjD4lWqZ3U0C7PMsQCHw=s96-c',
//     level: 1,
//     name: '이태훈',
//     mobile: null,
//     facebook: null,
//     status: -1,
//     license: null,
//     company: null
//   }