export const cities = [
  { name: "All Cities", image: "/assets/images/cities/manila.jpg" },
  { name: "Manila", image: "/assets/images/cities/manila.jpg" },
  { name: "Cebu", image: "/assets/images/cities/manila.jpg" },
  { name: "Taguig", image: "/assets/images/cities/manila.jpg" },
  { name: "Makati", image: "/assets/images/cities/manila.jpg" },
  { name: "Quezon", image: "/assets/images/cities/manila.jpg" },
];

export const furnitureOptions = [
  { label: "No Preference", value: "none" },
  { label: "Fully Furnished", value: "fully" },
  { label: "Semi-Furnished", value: "semi" },
  { label: "Unfurnished", value: "unfurnished" },
];

export const petPolicyOption = [
  { label: "No Preference", value: "none" },
  { label: "Allow", value: "Allow" },
  { label: "Small Only", value: "Small Only" },
  { label: "Not allowed", value: "Not allowed" },
];

export const citiesWithRange = {
  manila: {
    name: "Manila",
    bounds: [
      [120.90, 14.52],  // 남서쪽 경계
      [121.09, 14.71],  // 북동쪽 경계
    ],
  },
  cebu: {
    name: "Cebu",
    bounds: [
      [123.82, 10.25],  // 남서쪽 경계
      [123.95, 10.40],  // 북동쪽 경계
    ],
  },
  davao: {
    name: "Davao",
    bounds: [
      [125.51, 6.90],   // 남서쪽 경계
      [125.65, 7.10],   // 북동쪽 경계
    ],
  },
  quezon: {
    name: "Quezon City",
    bounds: [
      [121.01, 14.62],  // 남서쪽 경계
      [121.10, 14.74],  // 북동쪽 경계
    ],
  },
  cdo: {
    name: "Cagayan de Oro",
    bounds: [
      [124.62, 8.38],   // 남서쪽 경계
      [124.70, 8.50],   // 북동쪽 경계
    ],
  },
  iloilo: {
    name: "Iloilo",
    bounds: [
      [122.53, 10.64],  // 남서쪽 경계
      [122.60, 10.75],  // 북동쪽 경계
    ],
  },
  baguio: {
    name: "Baguio",
    bounds: [
      [120.56, 16.37],  // 남서쪽 경계
      [120.62, 16.45],  // 북동쪽 경계
    ],
  },
};
