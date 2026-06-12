"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import PreferencePanel from "./PreferencePanel";
import { fetchNearbyRestaurants } from "../services/restaurantService";
import type { Restaurant, UserPreferences } from "../types/restaurant";

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
  const [preferences, setPreferences] = useState<UserPreferences>({
    category: "all",
    cuisine: "",
  });
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

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
        setLocationStatus("Konum başarıyla alındı.");

        const nearbyRestaurants = await fetchNearbyRestaurants(
          currentLocation.lat,
          currentLocation.lng,
          3000
        );

        setRestaurants(nearbyRestaurants);
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

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesCategory =
      preferences.category === "all" ||
      restaurant.category === preferences.category;

    const matchesCuisine =
      preferences.cuisine.trim() === "" ||
      restaurant.cuisine
        ?.toLowerCase()
        .includes(preferences.cuisine.toLowerCase());

    return matchesCategory && matchesCuisine;
  });

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "360px 1fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      <aside
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <p style={{ color: "#667085", marginBottom: "12px" }}>
          {locationStatus}
        </p>

        <PreferencePanel preferences={preferences} onChange={setPreferences} />

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "14px",
            background: "#f8fafc",
          }}
        >
          <strong>{filteredRestaurants.length}</strong> mekan gösteriliyor
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "12px" }}>Senin İçin Uygun Mekanlar</h3>

          <div
            style={{
              display: "grid",
              gap: "12px",
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {filteredRestaurants.length === 0 ? (
              <p style={{ color: "#667085" }}>
                Seçimlerine uygun mekan bulunamadı.
              </p>
            ) : (
              filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  style={{
                    padding: "12px",
                    borderRadius: "14px",
                    border: "1px solid #e4e7ec",
                    background: "#ffffff",
                  }}
                >
                  <strong>{restaurant.name}</strong>

                  <p
                    style={{
                      margin: "6px 0",
                      color: "#667085",
                      fontSize: "14px",
                    }}
                  >
                    {restaurant.cuisine ?? restaurant.category}
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
                    {restaurant.category}
                  </span>

                  <button
                    onClick={() => toggleFavorite(restaurant.id)}
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "8px",
                      borderRadius: "10px",
                      border: "1px solid #e4e7ec",
                      background: favoriteIds.includes(restaurant.id)
                        ? "#fff7ed"
                        : "#f9fafb",
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
                <strong>{restaurant.name}</strong>
                <br />
                {restaurant.cuisine ?? restaurant.category}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}