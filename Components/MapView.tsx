"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("Konum başarıyla alındı.");
      },
      () => {
        setLocationStatus("Konum izni verilmedi. Varsayılan konum gösteriliyor.");
      }
    );
  }, []);

  return (
    <section>
      <p>{locationStatus}</p>

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={14}
        style={{ height: "500px", width: "100%", borderRadius: "12px" }}
      >
        <ChangeMapView location={userLocation} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>Şu anki konumunuz</Popup>
        </Marker>
      </MapContainer>
    </section>
  );
}