import { ChevronLeft, MoreVertical, Play } from "lucide-react";
import { Link, useLocation } from "wouter";
import { EMOTION_LABELS, useMoodify } from "@/context/MoodifyContext";
import { cn } from "@/lib/utils";
import type { Song } from "@shared/schema";

function formatDuration(_song: Song, index: number) {
  // No duration from API — deterministic display durations matching design feel
  const catalog = ["4:50", "3:42", "5:18", "4:05", "3:28", "4:33"];
  return catalog[index % catalog.length];
}

function genreFromEmotion(emotion: string) {
  switch (emotion) {
    case "happy":
      return "POP";
    case "sad":
      return "AMBIENT";
    case "angry":
      return "INTENSE";
    case "neutral":
      return "LOFI";
    case "surprised":
      return "SYNTH";
    case "fearful":
      return "DRONE";
    case "disgusted":
      return "JAZZ";
    default:
      return "EXPERIMENTAL";
  }
}

export default function Explore() {
  const [, setLocation] = useLocation();
  const {
    currentEmotion,
    stableEmotion,
    songs,
    songsLoading,
    songsError,
    playSong,
    currentSong,
    isPlaying,
    refreshSongs,
  } = useMoodify();

  const activeEmotion = stableEmotion || currentEmotion;
  const labels = activeEmotion
    ? EMOTION_LABELS[activeEmotion.emotion]
    : {
        criteria: "DETECTION CRITERIA // STANDBY",
        title: "Awaiting Neural Signal",
      };

  const handlePlay = (song: Song) => {
    playSong(song);
    setLocation("/now-spinning");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col max-w-3xl mx-auto w-full">
      {/* Top bar */}
      <header className="px-4 md:px-6 pt-5 pb-4 flex items-center justify-between">
        <Link href="/" className="text-white hover:text-lime transition-colors p-1">
          <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
        </Link>
        <h1 className="font-sans font-bold text-white text-sm tracking-[0.15em] uppercase">
          STARK SPECTRUM
        </h1>
        <button
          type="button"
          onClick={refreshSongs}
          className="text-white hover:text-lime transition-colors p-1"
          aria-label="Refresh catalogue"
        >
          <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </header>

      <div className="px-4 md:px-6 flex flex-col gap-5 pb-8">
        {/* Hero criteria */}
        <div className="border border-moodify-border px-5 py-6 md:py-8">
          <p className="font-mono text-[10px] md:text-xs tracking-widest text-lime uppercase mb-3">
            {labels.criteria}
          </p>
          <h2 className="font-serif italic text-3xl md:text-4xl text-white leading-tight">
            {labels.title}
          </h2>
        </div>

        {/* Catalogue */}
        <p className="font-sans text-[11px] tracking-widest text-moodify-muted uppercase">
          CATALOGUE: {songsLoading ? "…" : `${songs?.length ?? 0} MATCHES`}
        </p>

        {!activeEmotion && (
          <div className="border border-moodify-border p-8 text-center">
            <p className="font-mono text-xs text-moodify-muted tracking-wider uppercase mb-4">
              No detection criteria locked
            </p>
            <Link
              href="/"
              className="inline-block font-mono text-xs text-lime border border-lime px-5 py-3 tracking-widest hover:bg-lime hover:text-black transition-colors"
            >
              RETURN TO EDITORIAL
            </Link>
          </div>
        )}

        {songsLoading && (
          <div className="py-12 text-center font-mono text-xs text-lime tracking-wider animate-pulse">
            INDEXING SPECTRUM…
          </div>
        )}

        {songsError && (
          <div className="border border-moodify-border p-6 text-center">
            <p className="font-mono text-xs text-moodify-muted tracking-wider mb-4">
              FAILED TO LOAD CATALOGUE
            </p>
            <button
              type="button"
              onClick={refreshSongs}
              className="font-mono text-xs text-lime border border-lime px-5 py-3 tracking-widest"
            >
              RETRY
            </button>
          </div>
        )}

        {songs && songs.length > 0 && (
          <ul className="flex flex-col gap-3">
            {songs.map((song, index) => {
              const active = currentSong?.id === song.id;
              return (
                <li key={song.id}>
                  <button
                    type="button"
                    onClick={() => handlePlay(song)}
                    className={cn(
                      "w-full border px-4 py-4 flex items-center justify-between gap-4 text-left transition-colors",
                      active ? "border-lime bg-lime/5" : "border-moodify-border hover:border-white/30"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-sans font-semibold text-white text-sm md:text-base truncate">
                        {song.name}
                      </p>
                      <p className="font-sans text-[11px] text-moodify-muted tracking-wide uppercase mt-1 truncate">
                        {song.artist} // {genreFromEmotion(song.emotion)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-lime">
                        {formatDuration(song, index)}
                      </span>
                      <span className="w-8 h-8 border border-lime flex items-center justify-center text-lime">
                        {active && isPlaying ? (
                          <span className="flex gap-[3px]">
                            <span className="w-[3px] h-3 bg-lime" />
                            <span className="w-[3px] h-3 bg-lime" />
                          </span>
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-lime" strokeWidth={0} />
                        )}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {!songsLoading && activeEmotion && songs && songs.length === 0 && (
          <div className="border border-moodify-border p-8 text-center font-mono text-xs text-moodify-muted tracking-wider">
            ZERO MATCHES IN SPECTRUM
          </div>
        )}
      </div>
    </div>
  );
}
