export type Restaurant = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  cuisine?: string;
  address?: string;
  category: "restaurant" | "cafe" | "fast_food";
};