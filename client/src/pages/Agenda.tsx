import { EMOTION_LABELS, useMoodify } from "@/context/MoodifyContext";

export default function Agenda() {
  const { weather, currentEmotion, stableEmotion, currentSong, likedIds, formatLocation } =
    useMoodify();

  const activeEmotion = stableEmotion || currentEmotion;
  const labels = activeEmotion ? EMOTION_LABELS[activeEmotion.emotion] : null;

  const rows = [
    {
      key: "LOC",
      label: "LOCATION FEED",
      value: weather ? formatLocation(weather.location) : "OFFLINE",
    },
    {
      key: "WX",
      label: "AMBIENT INDEX",
      value: weather
        ? `${weather.temperature}°C · ${weather.condition.toUpperCase()}`
        : "PENDING",
    },
    {
      key: "MOOD",
      label: "NEURAL STATE",
      value: activeEmotion
        ? `${activeEmotion.emotion.toUpperCase()} · ${Math.round(activeEmotion.probability * 100)}%`
        : "UNRESOLVED",
    },
    {
      key: "SPEC",
      label: "SPECTRUM TARGET",
      value: labels?.title.toUpperCase() || "—",
    },
    {
      key: "NOW",
      label: "ACTIVE TRACK",
      value: currentSong ? `${currentSong.name} — ${currentSong.artist}` : "IDLE",
    },
    {
      key: "LIKED",
      label: "SAVED SIGNALS",
      value: `${likedIds.size} ENTRIES`,
    },
  ];

  return (
    <div className="min-h-screen bg-black max-w-3xl mx-auto w-full">
      <header className="px-4 md:px-6 pt-5 pb-4 border-b border-moodify-border">
        <h1 className="font-sans font-bold text-white text-sm tracking-[0.15em] uppercase">
          AGENDA // SESSION LOG
        </h1>
        <p className="font-mono text-[10px] text-moodify-muted tracking-wider mt-2 uppercase">
          Live system readout · no persistence
        </p>
      </header>

      <div className="px-4 md:px-6 py-6 flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.key}
            className="border border-moodify-border px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <div>
              <p className="font-mono text-[10px] text-lime tracking-widest">{row.key}</p>
              <p className="font-sans text-xs text-moodify-muted tracking-wider uppercase mt-1">
                {row.label}
              </p>
            </div>
            <p className="font-mono text-xs text-white tracking-wide sm:text-right uppercase truncate max-w-full sm:max-w-[55%]">
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
