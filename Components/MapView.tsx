"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MapView() {
  return (
    <MapContainer
      center={[39.7767, 30.5206]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[39.7767, 30.5206]}>
        <Popup>Eskişehir Merkez</Popup>
      </Marker>
    </MapContainer>
  );
}