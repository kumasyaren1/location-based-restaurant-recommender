"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PreferencePanel from "./PreferencePanel";
import { fetchNearbyRestaurants } from "../services/restaurantService";
import type { Restaurant, UserPreferences } from "../types/restaurant";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Location = {
  lat: number;
  lng: number;
};

const defaultLocation: Location = {
  lat: 39.7767,
  lng: 30.5206,
};

function ChangeMapView({ location }: { location: Location }) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], 14);
  }, [location, map]);

  return null;
}

export default function MapView() {
  const [userLocation, setUserLocation] = useState<Location>(defaultLocation);
  const [locationStatus, setLocationStatus] = useState("Konum alınıyor...");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    category: "all",
    cuisine: "",
    maxDistance: 5000,
  });
  useEffect(() => {
  const savedPreferences = localStorage.getItem("userPreferences");

  if (savedPreferences) {
    setPreferences(JSON.parse(savedPreferences));
  }
}, []);
  useEffect(() => {
  localStorage.setItem("userPreferences", JSON.stringify(preferences));
}, [preferences]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoriteRestaurants");

    if (savedFavorites) {
      setFavoriteIds(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(currentLocation);
        setLocationStatus("Yakındaki mekanlar aranıyor...");

        try {
          const nearbyRestaurants = await fetchNearbyRestaurants(
            currentLocation.lat,
            currentLocation.lng,
            3000
          );

          setRestaurants(nearbyRestaurants);
          setLocationStatus("Mekanlar başarıyla getirildi.");
        } catch (error) {
          console.warn("Overpass API geçici olarak yanıt vermedi:", error);
          setLocationStatus(
            "Konum alındı ancak mekan verileri şu anda getirilemedi."
          );
          setRestaurants([]);
        }
      },
      () => {
        setLocationStatus("Konum izni verilmedi. Varsayılan konum gösteriliyor.");
      }
    );
  }, []);

  const toggleFavorite = (restaurantId: number) => {
    const updatedFavorites = favoriteIds.includes(restaurantId)
      ? favoriteIds.filter((id) => id !== restaurantId)
      : [...favoriteIds, restaurantId];

    setFavoriteIds(updatedFavorites);
    localStorage.setItem("favoriteRestaurants", JSON.stringify(updatedFavorites));
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };
  const formatCuisine = (cuisine?: string) => {
  if (!cuisine) return "Mutfak bilgisi yok";

  return cuisine
    .split(";")
    .slice(0, 3)
    .map((item) =>
      item
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    )
    .join(" • ");
};

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      preferences.category === "all" ||
      restaurant.category === preferences.category;

    const matchesCuisine =
      preferences.cuisine.trim() === "" ||
      restaurant.cuisine
        ?.toLowerCase()
        .includes(preferences.cuisine.toLowerCase());

    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      restaurant.lat,
      restaurant.lng
    );

    const matchesDistance = distance <= preferences.maxDistance;

    return matchesCategory && matchesCuisine && matchesDistance;
  });

  const recommendedRestaurants = filteredRestaurants
    .map((restaurant) => {
      let score = 0;

      if (
        preferences.category !== "all" &&
        restaurant.category === preferences.category
      ) {
        score += 50;
      }

      if (
        preferences.cuisine.trim() !== "" &&
        restaurant.cuisine
          ?.toLowerCase()
          .includes(preferences.cuisine.toLowerCase())
      ) {
        score += 30;
      }

      if (favoriteIds.includes(restaurant.id)) {
        score += 20;
      }

      return {
        ...restaurant,
        score,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.lat,
          restaurant.lng
        ),
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "420px 1fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      <aside
        style={{
  background: "rgba(255, 255, 255, 0.92)",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 45px rgba(234, 88, 12, 0.12)",
  border: "1px solid #fed7aa",
}}
      >
        <p style={{ color: "#667085", marginBottom: "12px" }}>
          {locationStatus}
        </p>

        <PreferencePanel preferences={preferences} onChange={setPreferences} />

        <div
  style={{
    marginTop: "16px",
    padding: "14px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #fb923c, #f97316)",
    color: "white",
    fontWeight: 600,
    boxShadow: "0 10px 20px rgba(249,115,22,0.25)",
  }}
>
  🍽️ {filteredRestaurants.length} mekan gösteriliyor
</div>
        <div style={{ marginTop: "20px" }}>
         <h3
  style={{
    color: "#ea580c",
    fontSize: "22px",
    marginBottom: "12px",
  }}
>
  🔥 Senin İçin En Uygun Mekanlar 🔥
</h3>

          <div
           style={{
   display: "grid",
  gap: "12px",
  maxHeight: "360px",
  overflowY: "auto",
}}
          >
            {recommendedRestaurants.length === 0 ? (
              <p style={{ color: "#667085" }}>
                Seçimlerine uygun mekan bulunamadı.
              </p>
            ) : (
              recommendedRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1px solid #e4e7ec",
                    background: "#ffffff",
                  }}
                >
                  <h4
  style={{
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: "#111827",
    fontWeight: 800,
  }}
>
  {restaurant.name || "İsimsiz Mekan"}
</h4>

<div
  style={{
    margin: "4px 0",
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.4",
  }}
>
  {formatCuisine(restaurant.cuisine)}
</div>

                  <p
                    style={{
                      marginTop: "6px",
                      fontSize: "13px",
                      color: "#667085",
                    }}
                  >
                    {Math.round(restaurant.distance)} m uzaklıkta
                  </p>
                    <p
  style={{
    marginTop: "6px",
    fontSize: "13px",
    color: "#667085",
  }}
>
  📍 {restaurant.address}
</p>

                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: "999px",
                      background: "#eef2ff",
                      fontSize: "12px",
                    }}
                  >
                    {restaurant.category === "fast_food"
  ? "Fast Food"
  : restaurant.category === "cafe"
  ? "Kafe"
  : "Restoran"}
                  </span>

                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#475467",
                    }}
                  >
                    Öneri puanı: {restaurant.score}
                  </p>

                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                   style={{
  marginTop: "10px",
  width: "100%",
  padding: "10px",
  borderRadius: "14px",
  border: "none",
  background: favoriteIds.includes(restaurant.id)
    ? "linear-gradient(135deg, #f97316, #ea580c)"
    : "#fff7ed",
  color: favoriteIds.includes(restaurant.id) ? "white" : "#ea580c",
  fontWeight: 700,
  cursor: "pointer",
}}
                  >
                    {favoriteIds.includes(restaurant.id)
                      ? "★ Favorilerde"
                      : "☆ Favoriye ekle"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <div>
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          style={{
            height: "620px",
            width: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
          }}
        >
          <ChangeMapView location={userLocation} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Şu anki konumunuz</Popup>
          </Marker>

          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lng]}
            >
              <Popup>
                <h4
  style={{
    margin: "0 0 8px 0",
    fontSize: "18px",
    color: "#111827",
    fontWeight: 800,
  }}
>
  {restaurant.name || "İsimsiz Mekan"}
</h4>
                <br />
                {formatCuisine(restaurant.cuisine)}
                  <br />
📍 {restaurant.address}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}