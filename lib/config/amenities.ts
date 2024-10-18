import {
  MdOutlineCleaningServices,
  MdOutlineSecurity,
  MdOutlineLibraryBooks,
  MdOutlinePool,
  MdOutlineFitnessCenter,
  MdOutlineLandscape,
  MdOutlineToys,
  MdOutlineRule,
  MdOutlineAspectRatio,
  MdOutlineLocalFlorist,
  MdOutlineSpa,
  MdOutlineShield,
  MdOutlineSupportAgent,
  MdOutlineWater,
  MdOutlineSportsHandball,
  MdOutlineShoppingBag,
} from "react-icons/md";
import { GiWindowBars } from "react-icons/gi";

export interface Amenity {
  label: string;
  icon: React.ElementType; // React 컴포넌트 타입으로 선언
}

export const amenitiesData: Amenity[] = [
  { label: "Mountain View", icon: MdOutlineLandscape },
  { label: "Water View", icon: MdOutlineWater },
  { label: "Gym", icon: MdOutlineFitnessCenter },
  { label: "Playroom", icon: MdOutlineToys },
  { label: "High Ceiling", icon: MdOutlineRule },
  { label: "Large Windows", icon: MdOutlineAspectRatio },
  { label: "Soundproof", icon: GiWindowBars },
  { label: "Garden", icon: MdOutlineLocalFlorist },
  { label: "Spa", icon: MdOutlineSpa },
  { label: "Sauna", icon: MdOutlineSpa },
  { label: "24/7 Security", icon: MdOutlineSecurity },
  { label: "Concierge", icon: MdOutlineSupportAgent },
  { label: "Library", icon: MdOutlineLibraryBooks },
  { label: "Pool", icon: MdOutlinePool },
  { label: "Jogging", icon: MdOutlineSportsHandball },
  { label: "Retail", icon: MdOutlineShoppingBag },
];
