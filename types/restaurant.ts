export type RestaurantCategory = "restaurant" | "cafe" | "fast_food" | "all";

export type Restaurant = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  cuisine?: string;
  address?: string;
  category: "restaurant" | "cafe" | "fast_food";
};

export type UserPreferences = {
  category: RestaurantCategory;
  cuisine: string;
  maxDistance: number;
};