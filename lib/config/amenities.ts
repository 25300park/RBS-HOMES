import {
  FaSwimmingPool,
  FaDumbbell,
  FaMountain,
  FaPlay,
  FaRulerVertical,
  FaWindowMaximize,
  FaTree,
  FaSpa,
  FaShieldAlt,
  FaConciergeBell,
  FaBook,
  FaWater,
  FaRunning,
  FaShoppingBag,
} from "react-icons/fa";
import {
  MdOutlineCleaningServices,
  MdOutlineSecurity,
  MdOutlineLibraryBooks,
} from "react-icons/md";
import { GiWindowBars } from "react-icons/gi";

export interface Amenity {
  label: string;
  icon: React.ElementType; // React 컴포넌트 타입으로 선언
}

export const amenitiesData: Amenity[] = [
  { label: "Open Views", icon: FaMountain }, // Open Views -> Mountain view icon
  { label: "Water Views", icon: FaWater }, // Water Views -> Water icon
  { label: "Gym", icon: FaDumbbell }, // Gym -> Dumbbell icon
  { label: "Playroom", icon: FaPlay }, // Playroom -> Play icon
  { label: "High Ceilings", icon: FaRulerVertical }, // High Ceilings -> Ruler for height
  { label: "Oversized Windows", icon: FaWindowMaximize }, // Oversized Windows -> Window icon
  { label: "Soundproof Windows", icon: GiWindowBars }, // Soundproof Windows -> Window with bars icon
  { label: "Garden", icon: FaTree }, // Garden -> Tree icon
  { label: "Spa", icon: FaSpa }, // Spa -> Spa icon
  { label: "Sauna", icon: FaSpa }, // Sauna -> Spa icon as no specific sauna icon exists
  { label: "24/7 Security", icon: MdOutlineSecurity }, // 24/7 Security -> Security icon
  { label: "Concierge/Lounge", icon: FaConciergeBell }, // Concierge/Lounge -> Concierge bell icon
  { label: "Library/Study Hall", icon: MdOutlineLibraryBooks }, // Library/Study Hall -> Library books icon
  { label: "Pool", icon: FaSwimmingPool }, // Pool -> Swimming pool icon
  { label: "Jogging Trail", icon: FaRunning }, // Jogging Trail -> Running icon
  { label: "Retail Area", icon: FaShoppingBag }, // Retail Area -> Shopping bag icon
];
