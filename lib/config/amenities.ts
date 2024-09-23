import {
  FaSwimmingPool,
  FaDumbbell,
  FaCar,
  FaPaw,
  FaBook,
  FaWater,
  FaWifi,
  FaUtensils,
  FaSpa,
  FaBicycle,
} from "react-icons/fa";
import {
  MdOutlineCleaningServices,
  MdOutlineSecurity,
} from "react-icons/md";

export interface Amenity {
  label: string;
  icon: React.ElementType; // React 컴포넌트 타입으로 선언
}

export const amenitiesData: Amenity[] = [
  { label: "Gym", icon: FaDumbbell },
  { label: "Pool", icon: FaSwimmingPool },
  { label: "Parking", icon: FaCar },
  { label: "Pet Friendly", icon: FaPaw },
  { label: "Library", icon: FaBook },
  { label: "Water Views", icon: FaWater },
  { label: "Wi-Fi", icon: FaWifi },
  { label: "Restaurant", icon: FaUtensils },
  { label: "Spa", icon: FaSpa },
  { label: "Bicycle Storage", icon: FaBicycle },
  { label: "Housekeeping", icon: MdOutlineCleaningServices },
  { label: "Security", icon: MdOutlineSecurity },
];
