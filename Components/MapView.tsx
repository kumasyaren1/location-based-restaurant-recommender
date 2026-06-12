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
      <p style={{ color: "#667085", marginBottom: "12px" }}>{locationStatus}</p>

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
          <Marker key={restaurant.id} position={[restaurant.lat, restaurant.lng]}>
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
);}