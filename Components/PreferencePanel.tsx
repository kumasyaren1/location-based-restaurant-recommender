import type { UserPreferences } from "../types/restaurant";

type PreferencePanelProps = {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid #d0d5dd",
  marginTop: "6px",
};

export default function PreferencePanel({
  preferences,
  onChange,
}: PreferencePanelProps) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div>
        <label style={{ fontWeight: 600 }}>Kategori</label>
        <select
          style={fieldStyle}
          value={preferences.category}
          onChange={(e) =>
            onChange({
              ...preferences,
              category: e.target.value as UserPreferences["category"],
            })
          }
        >
          <option value="all">Tümü</option>
          <option value="restaurant">Restoran</option>
          <option value="cafe">Kafe</option>
          <option value="fast_food">Fast Food</option>
        </select>
      </div>

      <div>
        <label style={{ fontWeight: 600 }}>Mutfak türü</label>
          <div>
  <label style={{ fontWeight: 600 }}>
    Maksimum Mesafe ({preferences.maxDistance} m)
  </label>

  <input
    type="range"
    min="500"
    max="5000"
    step="500"
    value={preferences.maxDistance}
    onChange={(e) =>
      onChange({
        ...preferences,
        maxDistance: Number(e.target.value),
      })
    }
    style={{ width: "100%", marginTop: "10px" }}
  />
</div>
        <input
          style={fieldStyle}
          placeholder="pizza, kebap, kahve..."
          value={preferences.cuisine}
          onChange={(e) =>
            onChange({
              ...preferences,
              cuisine: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
}