import MapViewWrapper from "../Components/MapViewWrapper";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background:
          "linear-gradient(135deg, #fff7ed 0%, #fffbeb 45%, #f8fafc 100%)",
      }}
    >
      <section style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "28px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#ffedd5",
                color: "#ea580c",
                fontWeight: 700,
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              🍽️ Location Based Food Discovery
            </span>

            <h1
              style={{
                fontSize: "38px",
                margin: 0,
                color: "#1f2937",
                letterSpacing: "-0.8px",
              }}
            >
              Akıllı Restoran Öneri Sistemi
            </h1>

            <p
              style={{
                color: "#667085",
                fontSize: "17px",
                marginTop: "10px",
              }}
            >
              Konumuna ve tercihlerine göre çevrendeki restoran, kafe ve fast-food
              mekanlarını keşfet.
            </p>
          </div>
        </div>

        <MapViewWrapper />
      </section>
    </main>
  );
}