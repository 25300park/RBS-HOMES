import CityCard from "./city-card";

const cities = [
  {
    name: "Manila",
    listings: "57,420",
    imageUrl: "/assets/images/cities/manila.jpg",
  },
  {
    name: "Taguig (Bonifacio Global City)",
    listings: "5,230",
    imageUrl: "/assets/images/cities/manila.jpg",
    description: "BGC",
  },
  {
    name: "Makati",
    listings: "3,690",
    imageUrl: "/assets/images/cities/manila.jpg",
  },
  {
    name: "Cebu",
    listings: "51,806",
    imageUrl: "/assets/images/cities/manila.jpg",
  },
  {
    name: "Tagaytay",
    listings: "6,859",
    imageUrl: "/assets/images/cities/manila.jpg",
  },

];

const CityGrid = () => (
  <div className="max-w-[1140px] mx-auto ">
    <h3 className="text-[#00092B] font-semibold text-xl mb-3">POPULAR PLACES</h3>
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr",
        gridTemplateRows: "repeat(2, 1fr)",
        gridTemplateAreas: `
          "manila cebu tagaytay"
          "manila makati taguig"
        `,
        gap: "1rem",
      }}
    >
      {/* 마닐라를 크게 표시 */}
      <div style={{ gridArea: "manila" }}>
        <CityCard
          name={cities[0].name}
          listings={cities[0].listings}
          imageUrl={cities[0].imageUrl}
        />
      </div>

      {/* 나머지 도시들 */}
      {cities.slice(1).map((city, index) => (
        <div
          key={index}
          style={{ gridArea: ["cebu", "tagaytay", "makati", "taguig"][index] }}
        >
          <CityCard
            name={city.name}
            listings={city.listings}
            imageUrl={city.imageUrl}
            description={city.description}
          />
        </div>
      ))}
    </div>
  </div>
);

export default CityGrid;
