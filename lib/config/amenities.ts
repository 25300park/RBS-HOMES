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
  imagePath: string;
}

export const amenitiesData: Amenity[] = [
  { label: "Mountain View", imagePath: "/assets/icons/amenities/MountainView.png" },
  { label: "Water View", imagePath: "/assets/icons/amenities/WaterView.png" },
  { label: "Gym", imagePath: "/assets/icons/amenities/Gym.png" },
  { label: "Playroom", imagePath: "/assets/icons/amenities/Palyroom.png" },
  { label: "High Ceiling", imagePath: "/assets/icons/amenities/HighCeiling.png" },
  { label: "Large Windows", imagePath: "/assets/icons/amenities/LargeWindows.png" },
  { label: "Soundproof", imagePath: "/assets/icons/amenities/soundproof.png" },
  { label: "Garden", imagePath: "/assets/icons/amenities/Garden.png" },
  { label: "Spa", imagePath: "/assets/icons/amenities/Spa.png" },
  { label: "Sauna", imagePath: "/assets/icons/amenities/Sauna.png" },
  { label: "24/7 Security", imagePath: "/assets/icons/amenities/Security.png" },
  { label: "Concierge", imagePath: "/assets/icons/amenities/Concierge.png" },
  { label: "Library", imagePath: "/assets/icons/amenities/Library.png" },
  { label: "Pool", imagePath: "/assets/icons/amenities/Pool.png" },
  { label: "Jogging", imagePath: "/assets/icons/amenities/Jogging.png" },
  { label: "Retail", imagePath: "/assets/icons/amenities/Retail.png" },
];
// export const amenitiesData: Amenity[] = [
//   { label: "Mountain View", icon: MdOutlineLandscape },
//   { label: "Water View", icon: MdOutlineWater },
//   { label: "Gym", icon: MdOutlineFitnessCenter },
//   { label: "Playroom", icon: MdOutlineToys },
//   { label: "High Ceiling", icon: MdOutlineRule },
//   { label: "Large Windows", icon: MdOutlineAspectRatio },
//   { label: "Soundproof", icon: GiWindowBars },
//   { label: "Garden", icon: MdOutlineLocalFlorist },
//   { label: "Spa", icon: MdOutlineSpa },
//   { label: "Sauna", icon: MdOutlineSpa },
//   { label: "24/7 Security", icon: MdOutlineSecurity },
//   { label: "Concierge", icon: MdOutlineSupportAgent },
//   { label: "Library", icon: MdOutlineLibraryBooks },
//   { label: "Pool", icon: MdOutlinePool },
//   { label: "Jogging", icon: MdOutlineSportsHandball },
//   { label: "Retail", icon: MdOutlineShoppingBag },

// ];
