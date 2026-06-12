import type { UserPreferences } from "../types/restaurant";

type PreferencePanelProps = {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
};

export default function PreferencePanel({
  preferences,
  onChange,
}: PreferencePanelProps) {
  return (
    <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
      <label>
        Kategori:
        <select
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
      </label>

      <label>
        Mutfak türü:
        <input
          placeholder="pizza, kebab, coffee..."
          value={preferences.cuisine}
          onChange={(e) =>
            onChange({
              ...preferences,
              cuisine: e.target.value,
            })
          }
        />
      </label>
    </div>
  );
}