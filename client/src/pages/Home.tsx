import { useLocation } from "wouter";
import CameraFeed from "@/components/CameraFeed";
import { EMOTION_LABELS, useMoodify } from "@/context/MoodifyContext";

export default function Home() {
  const [, setLocation] = useLocation();
  const {
    currentEmotion,
    stableEmotion,
    weather,
    setCurrentEmotion,
    setStableEmotion,
    discoverMusic,
    formatLocation,
  } = useMoodify();

  const activeEmotion = stableEmotion || currentEmotion;
  const labels = activeEmotion ? EMOTION_LABELS[activeEmotion.emotion] : null;

  const locationText = weather
    ? `LOCATION : ${formatLocation(weather.location)}`
    : "LOCATION : ACQUIRING…";

  const weatherText = weather
    ? `${weather.temperature}°C · ${weather.condition.toUpperCase()}`
    : "— · READING AMBIENT…";

  const assessmentText = activeEmotion
    ? `Neural assessment complete. Ambient ${weather?.condition?.toLowerCase() || "conditions"} indexes matched. ${labels?.spectrum || ""}`
    : "Neural assessment pending. Align face with camera frame. Ambient indexes will sync once signal is stable.";

  const handleDiscover = () => {
    discoverMusic();
    if (activeEmotion) {
      setLocation("/explore");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="px-4 md:px-8 pt-5 pb-3 flex items-center justify-between border-b border-white/20">
        <h1 className="font-sans font-bold text-lime text-sm md:text-base tracking-wide">
          MOODIFY <span className="font-normal">/</span> EDITORIAL
        </h1>
        <span className="font-mono text-[10px] md:text-xs text-moodify-muted tracking-wider">
          SYS_ACTIVE
        </span>
      </header>

      {/* Location bar — solid strip matching Figma HUD */}
      <div className="bg-[#0a0a0a] border-y border-white/10 px-4 md:px-8 py-3 flex items-center justify-between gap-3 font-mono text-[10px] md:text-xs tracking-wider">
        <span className="text-lime truncate">{locationText}</span>
        <span className="text-lime shrink-0 text-right">{weatherText}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-stretch lg:gap-10 px-4 md:px-8 py-6 md:py-10 max-w-6xl mx-auto w-full">
        <div className="flex-1 flex flex-col justify-center">
          <CameraFeed
            onEmotionDetected={setCurrentEmotion}
            onStableEmotionDetected={setStableEmotion}
            cameraLabel={labels?.camera || "CAMERA STATE : AWAITING SIGNAL"}
          />
        </div>

        {/* CTA block */}
        <div className="mt-8 lg:mt-0 lg:w-[380px] xl:w-[420px] flex flex-col justify-end">
          <div className="bg-black border border-moodify-border p-5 md:p-7 flex flex-col gap-6">
            <p className="font-sans text-sm md:text-[15px] leading-relaxed text-moodify-muted-light">
              {assessmentText}
            </p>
            <button
              type="button"
              onClick={handleDiscover}
              className="w-full border border-lime bg-black py-4 px-4 font-mono text-xs md:text-sm tracking-widest uppercase text-lime hover:bg-lime hover:text-black transition-colors"
            >
              DISCOVER EXPERIMENTAL MUSIC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
