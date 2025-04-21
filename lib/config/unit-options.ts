import { BsBuildingsFill } from "react-icons/bs";
import { FaHome, FaBuilding, FaWarehouse, FaHotel } from "react-icons/fa";
import { PiIslandFill } from "react-icons/pi";
import { MdHolidayVillage } from "react-icons/md";
import { AiFillMessage } from "react-icons/ai";
export interface typeOptionType {
  label: string;
  value: string;
  icon: React.ElementType; // React 컴포넌트 타입으로 선언
}

export const cities = [
  { name: "All Cities", image: "/assets/images/cities/manila.jpg" },
  { name: "Manila", image: "/assets/images/cities/manila.jpg" },
  { name: "Cebu", image: "/assets/images/cities/manila.jpg" },
  { name: "Taguig", image: "/assets/images/cities/manila.jpg" },
  { name: "Makati", image: "/assets/images/cities/manila.jpg" },
  { name: "Quezon", image: "/assets/images/cities/manila.jpg" },
];

export const furnitureOptions = [
  { label: "Any", value: "none" },
  { label: "Fully-Furnished", value: "fully" },
  { label: "Semi-Furnished", value: "semi" },
  { label: "Unfurnished", value: "unfurnished" },
];
export const interioredOption = [
  { label: "Interiored", value: "Interiored" },
  { label: "Non Interiored", value: "Non Interiored" },
];
export const parkingOption = [
  { label: "0", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5" },
];
export const bedOption = [
  { label: "studio", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6+", value: "6" },
];
export const bathOption = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6+", value: "6" },
];
export const floorOption = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5" },
];

export const petPolicyOption = [
  { label: "Any", value: "none" },
  { label: "Allow", value: "Allow" },
  { label: "Small Only", value: "Small Only" },
  { label: "Not allowed", value: "Not allowed" },
];

export const sellTypeOption = [
  { label: "Any", value: "none" },
  { label: "Rent", value: "rent" },
  { label: "Buy", value: "sale" },
  { label: "Pre Sale", value: "presale" },
];
export const typeOption: typeOptionType[] = [
  { label: "Any", value: "none", icon: BsBuildingsFill },
  { label: "Condo", value: "condo", icon: BsBuildingsFill },
  { label: "village", value: "village", icon: MdHolidayVillage },
  { label: "Apartment", value: "apartment", icon: FaBuilding },
  { label: "Land", value: "land", icon: PiIslandFill },
  { label: "etc.,", value: "etc", icon: AiFillMessage  },
];

export const unitStatusOptions = [
  { label: "Ongoing", value: "0" },
  { label: "Completed", value: "1" },
  { label: "Contracted", value: "2" },
  { label: "Under Negotiation", value: "3" },
];


export const citiesWithRange = {
  manila: {
    name: "Manila",
    bounds: [
      [120.9, 14.52], // 남서쪽 경계
      [121.09, 14.71], // 북동쪽 경계
    ],
  },
  cebu: {
    name: "Cebu",
    bounds: [
      [123.82, 10.25], // 남서쪽 경계
      [123.95, 10.4], // 북동쪽 경계
    ],
  },
  davao: {
    name: "Davao",
    bounds: [
      [125.51, 6.9], // 남서쪽 경계
      [125.65, 7.1], // 북동쪽 경계
    ],
  },
  quezon: {
    name: "Quezon City",
    bounds: [
      [121.01, 14.62], // 남서쪽 경계
      [121.1, 14.74], // 북동쪽 경계
    ],
  },
  cdo: {
    name: "Cagayan de Oro",
    bounds: [
      [124.62, 8.38], // 남서쪽 경계
      [124.7, 8.5], // 북동쪽 경계
    ],
  },
  iloilo: {
    name: "Iloilo",
    bounds: [
      [122.53, 10.64], // 남서쪽 경계
      [122.6, 10.75], // 북동쪽 경계
    ],
  },
  baguio: {
    name: "Baguio",
    bounds: [
      [120.56, 16.37], // 남서쪽 경계
      [120.62, 16.45], // 북동쪽 경계
    ],
  },
};

export const LocationWithCites = {
  "Metro Manila": [
    "Quezon City",
    "Makati",
    "Taguig",
    "Manila",
    "Mandaluyong",
    "Muntinlupa",
    "San Juan",
    "Las Piñas",
    "Parañaque",
    "Pasig",
  ],
  Cebu: [
    "Cebu",
    "Lapu-Lapu",
    "Mandaue",
    "Naga",
    "Talisay",
    "Liloan",
    "Consolacion",
    "Minglanilla",
    "Compostela",
    "Cordova",
  ],
  Cavite: [
    "Tagaytay",
    "Imus",
    "Dasmariñas",
    "Bacoor",
    "Alfonso",
    "General Trias",
    "Tanza",
    "Silang",
    "Carmona",
    "Naic",
  ],
  Laguna: [
    "Santa Rosa",
    "Los Baños",
    "Calamba",
    "San Pedro",
    "Biñan",
    "Cabuyao",
  ],
  Rizal: ["Antipolo", "Taytay", "Cainta"],
  "Davao del Sur": ["Davao"],
  Pampanga: [
    "Angeles",
    "San Fernando",
    "Mexico",
    "Mabalacat",
    "Porac",
    "Bacolor",
  ],
  Iloilo: ["Iloilo", "Pavia"],
  Batangas: [
    "Santo Tomas",
    "Batangas City",
    "Lipa",
    "Nasugbu",
    "San Juan",
    "Talisay",
  ],
  Bulacan: ["San Jose del Monte", "Meycauayan", "Malolos"],
  "Misamis Oriental": ["Cagayan de Oro"],
  "Negros Oriental": ["Dumaguete", "Valencia", "Bacong", "Sibulan", "Bayawan"],
};
