import MapViewWrapper from "../components/MapViewWrapper";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        background: "#f4f6f8",
      }}
    >
      <section style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
            Akıllı Restoran Öneri Sistemi
          </h1>
          <p style={{ color: "#667085" }}>
            Konumuna ve tercihlerine göre çevrendeki mekanları keşfet.
          </p>
        </div>

        <MapViewWrapper />
      </section>
    </main>
  );
}