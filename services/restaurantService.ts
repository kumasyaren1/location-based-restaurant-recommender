import { Restaurant } from "@/types/restaurant";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    name?: string;
    amenity?: "restaurant" | "cafe" | "fast_food";
    cuisine?: string;
    "addr:street"?: string;
  };
};

export async function fetchNearbyRestaurants(
  lat: number,
  lng: number,
  radius = 1500
): Promise<Restaurant[]> {
  const query = `
    [out:json];
    (
      node["amenity"~"restaurant|cafe|fast_food"](around:${radius},${lat},${lng});
    );
    out body;
  `;

  const response = await fetch("https://overpass.kumi.systems/api/interpreter", {
    method: "POST",
    body: query,
  });

  if (!response.ok) {
    throw new Error("Restoran verileri alınamadı.");
  }

  const data = await response.json();

  return data.elements
    .filter((item: OverpassElement) => item.lat && item.lon && item.tags?.name)
    .map((item: OverpassElement) => ({
      id: item.id,
      name: item.tags?.name ?? "İsimsiz Mekan",
      lat: item.lat as number,
      lng: item.lon as number,
      cuisine: item.tags?.cuisine,
      address: item.tags?.["addr:street"],
      category: item.tags?.amenity ?? "restaurant",
    }));
}