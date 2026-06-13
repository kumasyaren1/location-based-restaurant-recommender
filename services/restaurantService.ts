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
    "addr:housenumber"?: string;
    "addr:neighbourhood"?: string;
    "addr:district"?: string;
    "addr:city"?: string;
  };
};

const formatAddress = (tags?: OverpassElement["tags"]) => {
  if (!tags) return "Adres bilgisi yok";

  const addressParts = [
    tags["addr:neighbourhood"],
    tags["addr:street"],
    tags["addr:housenumber"],
    tags["addr:district"],
    tags["addr:city"],
  ].filter(Boolean);

  return addressParts.length > 0
    ? addressParts.join(", ")
    : "Adres bilgisi yok";
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

  const endpoints = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

let data = null;

for (const endpoint of endpoints) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      continue;
    }

    data = await response.json();
    break;
  } catch (error) {
    console.warn(`${endpoint} yanıt vermedi:`, error);
  }
}

if (!data) {
  throw new Error("Restoran verileri alınamadı.");
}

  return data.elements
    .filter((item: OverpassElement) => item.lat && item.lon && item.tags?.name)
    .map((item: OverpassElement) => ({
      id: item.id,
      name: item.tags?.name ?? "İsimsiz Mekan",
      lat: item.lat as number,
      lng: item.lon as number,
      cuisine: item.tags?.cuisine,
      address: formatAddress(item.tags),
      category: item.tags?.amenity ?? "restaurant",
    }));
}