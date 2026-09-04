import { useRef } from "react";
import {
  ChevronDown,
  Heart,
  Pause,
  Play,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Link } from "wouter";
import { useMoodify } from "@/context/MoodifyContext";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  if (!seconds || !Number.isFinite(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function NowSpinning() {
  const {
    weather,
    currentSong,
    isPlaying,
    progress,
    duration,
    likedIds,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    toggleLike,
    formatLocation,
  } = useMoodify();

  const barRef = useRef<HTMLDivElement>(null);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = barRef.current;
    if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio);
  };

  const ratio = duration > 0 ? progress / duration : 0;
  const liked = currentSong ? likedIds.has(currentSong.id) : false;

  const locationLabel = weather
    ? `${formatLocation(weather.location).split("_")[0]} // ${weather.temperature}°C`
    : "LOC // —";

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-lg mx-auto w-full">
      {/* Header */}
      <header className="px-4 md:px-6 pt-5 pb-4 flex items-center justify-between">
        <Link href="/explore" className="text-white hover:text-lime transition-colors p-1">
          <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-mono text-[11px] md:text-xs tracking-widest text-white uppercase">
          NOW SPINNING // SYSTEM 01
        </h1>
        <button
          type="button"
          className="text-white hover:text-lime transition-colors p-1"
          aria-label="Share"
          onClick={() => {
            if (currentSong && navigator.share) {
              navigator.share({
                title: currentSong.name,
                text: `${currentSong.name} — ${currentSong.artist}`,
              }).catch(() => {});
            }
          }}
        >
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-4 md:px-6 flex flex-col gap-5 pb-8 flex-1">
        {/* Environment banner */}
        <div className="border border-moodify-border px-3 py-2.5 flex items-center justify-between font-mono text-[10px] md:text-xs tracking-wider uppercase">
          <span className="text-moodify-muted">MIST FEED ACTIVE</span>
          <span className="text-lime">{locationLabel}</span>
        </div>

        {/* Album art */}
        <div className="mx-auto w-full max-w-sm aspect-square border border-lime bg-moodify-surface overflow-hidden">
          {currentSong?.imageUrl ? (
            <img
              src={currentSong.imageUrl}
              alt={currentSong.name}
              className="w-full h-full object-cover grayscale"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[linear-gradient(135deg,#111_0%,#000_50%,#1a1a1a_100%)] relative">
              <div className="absolute inset-8 border border-white/10" />
              <div className="absolute inset-16 border border-white/5" />
              <p className="font-mono text-[10px] text-moodify-muted tracking-widest z-10">
                {currentSong ? "NO ARTWORK" : "NO SIGNAL"}
              </p>
            </div>
          )}
        </div>

        {/* Track info */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="min-w-0">
            <h2 className="font-serif italic text-2xl md:text-3xl text-white leading-tight truncate">
              {currentSong?.name || "Select a track"}
            </h2>
            <p className="font-mono text-xs text-moodify-muted tracking-widest uppercase mt-2">
              {currentSong?.artist || "—"}
            </p>
          </div>
          {currentSong && (
            <button
              type="button"
              onClick={() => toggleLike(currentSong.id)}
              className="shrink-0 mt-1"
              aria-label="Like"
            >
              <Heart
                className={cn("w-5 h-5 text-lime", liked && "fill-lime")}
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="pt-2">
          <div
            ref={barRef}
            onClick={handleSeek}
            className="h-[2px] w-full bg-moodify-border cursor-pointer relative"
          >
            <div
              className="absolute left-0 top-0 h-full bg-lime transition-[width] duration-150"
              style={{ width: `${Math.min(100, ratio * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 font-mono text-[10px] text-moodify-muted tracking-wider">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration || (currentSong ? 290 : 0))}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-2 md:px-6 pt-2">
          <button type="button" className="text-white/80 hover:text-lime p-2" aria-label="Shuffle">
            <Shuffle className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={playPrev}
            className="text-white hover:text-lime p-2"
            aria-label="Previous"
            disabled={!currentSong}
          >
            <SkipBack className="w-5 h-5 fill-white" strokeWidth={1} />
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!currentSong}
            className="w-14 h-14 border border-lime flex items-center justify-center text-lime hover:bg-lime/10 transition-colors disabled:opacity-40"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-lime text-lime" strokeWidth={0} />
            ) : (
              <Play className="w-6 h-6 fill-lime text-lime ml-0.5" strokeWidth={0} />
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            className="text-white hover:text-lime p-2"
            aria-label="Next"
            disabled={!currentSong}
          >
            <SkipForward className="w-5 h-5 fill-white" strokeWidth={1} />
          </button>
          <button type="button" className="text-white/80 hover:text-lime p-2" aria-label="Repeat">
            <Repeat className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
