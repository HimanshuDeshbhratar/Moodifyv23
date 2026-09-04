import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Emotion, Song, Weather } from "@shared/schema";

export type AppTab = "home" | "explore" | "now-spinning" | "agenda";

export const EMOTION_LABELS: Record<Emotion["emotion"], { criteria: string; title: string; camera: string; spectrum: string }> = {
  happy: {
    criteria: "DETECTION CRITERIA // UPLIFT SIGNAL",
    title: "Bright Pulse & Pop",
    camera: "CAMERA STATE : CONTINUOUS RADIANT",
    spectrum: "Generate bright acoustic uplift spectrum.",
  },
  sad: {
    criteria: "DETECTION CRITERIA // INTROSPECTIVE MIST",
    title: "Quiet Focus & Lofi",
    camera: "CAMERA STATE : CONTINUOUS CONTEMPLATIVE",
    spectrum: "Generate minimal acoustic focus spectrum.",
  },
  angry: {
    criteria: "DETECTION CRITERIA // HIGH VOLTAGE",
    title: "Stark Drive & Intensity",
    camera: "CAMERA STATE : CONTINUOUS INTENSE",
    spectrum: "Generate high-drive intensity spectrum.",
  },
  neutral: {
    criteria: "DETECTION CRITERIA // BALANCED FIELD",
    title: "Steady Ambient Flow",
    camera: "CAMERA STATE : CONTINUOUS NEUTRAL",
    spectrum: "Generate balanced ambient focus spectrum.",
  },
  surprised: {
    criteria: "DETECTION CRITERIA // SIGNAL SPIKE",
    title: "Sudden Spark & Synth",
    camera: "CAMERA STATE : CONTINUOUS ALERT",
    spectrum: "Generate experimental spark spectrum.",
  },
  fearful: {
    criteria: "DETECTION CRITERIA // SOFT SHELTER",
    title: "Calm Shelter & Drone",
    camera: "CAMERA STATE : CONTINUOUS CAUTIOUS",
    spectrum: "Generate calming shelter spectrum.",
  },
  disgusted: {
    criteria: "DETECTION CRITERIA // CLEANSE MODE",
    title: "Clean Reset & Jazz",
    camera: "CAMERA STATE : CONTINUOUS DETACHED",
    spectrum: "Generate cleansing instrumental spectrum.",
  },
};

interface MoodifyContextValue {
  currentEmotion: Emotion | null;
  stableEmotion: Emotion | null;
  weather: Weather | undefined;
  songs: Song[] | undefined;
  songsLoading: boolean;
  songsError: boolean;
  refreshTrigger: number;
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  likedIds: Set<string>;
  setCurrentEmotion: (emotion: Emotion) => void;
  setStableEmotion: (emotion: Emotion) => void;
  discoverMusic: () => void;
  refreshSongs: () => void;
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (ratio: number) => void;
  toggleLike: (songId: string) => void;
  formatLocation: (location?: string) => string;
}

const MoodifyContext = createContext<MoodifyContextValue | null>(null);

export function MoodifyProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [stableEmotion, setStableEmotion] = useState<Emotion | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTimer = useRef<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setWeatherLocation(`lat=${latitude}&lon=${longitude}`);
        },
        () => {
          setWeatherLocation("city=Mumbai");
          toast({
            title: "Location access denied",
            description: "Using Mumbai as default ambient feed.",
          });
        }
      );
    } else {
      setWeatherLocation("city=Mumbai");
    }
  }, [toast]);

  const { data: weather } = useQuery<Weather>({
    queryKey: [weatherLocation ? `/api/weather?${weatherLocation}` : null],
    enabled: !!weatherLocation,
    staleTime: 1000 * 60 * 10,
  });

  const activeEmotion = stableEmotion || currentEmotion;

  const {
    data: songs,
    isLoading: songsLoading,
    isError: songsError,
    refetch,
  } = useQuery<Song[]>({
    queryKey: [
      activeEmotion
        ? `/api/spotify/recommendations/emotion/${activeEmotion.emotion}?trigger=${refreshTrigger}`
        : null,
    ],
    enabled: !!activeEmotion,
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const clearProgressTimer = () => {
    if (progressTimer.current) {
      window.clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const startProgressTimer = useCallback((audio: HTMLAudioElement) => {
    clearProgressTimer();
    progressTimer.current = window.setInterval(() => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    }, 200);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    clearProgressTimer();
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
  }, []);

  const playSong = useCallback(
    (song: Song) => {
      if (!song.previewUrl) {
        if (song.youtube_link) {
          window.open(song.youtube_link, "_blank");
          toast({
            title: "Opening on YouTube",
            description: "Preview unavailable — opening external link.",
          });
        } else {
          window.open(`https://open.spotify.com/track/${song.id}`, "_blank");
          toast({
            title: "Opening in Spotify",
            description: "Preview unavailable — opening Spotify.",
          });
        }
        setCurrentSong(song);
        return;
      }

      stopAudio();
      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;
      setCurrentSong(song);
      setProgress(0);

      audio.play()
        .then(() => {
          setIsPlaying(true);
          startProgressTimer(audio);
        })
        .catch(() => {
          toast({
            title: "Playback error",
            description: "Could not play preview.",
            variant: "destructive",
          });
        });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        clearProgressTimer();
        setProgress(0);
      });

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration || 0);
      });
    },
    [startProgressTimer, stopAudio, toast]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentSong) return;

    if (!currentSong.previewUrl) {
      playSong(currentSong);
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      playSong(currentSong);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      clearProgressTimer();
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        startProgressTimer(audio);
      });
    }
  }, [currentSong, isPlaying, playSong, startProgressTimer]);

  const playNext = useCallback(() => {
    if (!songs || !currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const next = songs[(idx + 1) % songs.length];
    if (next) playSong(next);
  }, [songs, currentSong, playSong]);

  const playPrev = useCallback(() => {
    if (!songs || !currentSong) return;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    const prev = songs[(idx - 1 + songs.length) % songs.length];
    if (prev) playSong(prev);
  }, [songs, currentSong, playSong]);

  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const next = Math.max(0, Math.min(1, ratio)) * duration;
      audio.currentTime = next;
      setProgress(next);
    },
    [duration]
  );

  const toggleLike = useCallback((songId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) next.delete(songId);
      else next.add(songId);
      return next;
    });
  }, []);

  const discoverMusic = useCallback(() => {
    if (stableEmotion || currentEmotion) {
      if (!stableEmotion && currentEmotion) {
        setStableEmotion(currentEmotion);
      }
      setRefreshTrigger((p) => p + 1);
    } else {
      toast({
        title: "No emotion detected",
        description: "Look at the camera to complete neural assessment first.",
        variant: "destructive",
      });
    }
  }, [stableEmotion, currentEmotion, toast]);

  const refreshSongs = useCallback(() => {
    setRefreshTrigger((p) => p + 1);
  }, []);

  const formatLocation = (location?: string) => {
    if (!location) return "SCANNING…";
    return location.replace(/,\s*/g, "_").replace(/\s+/g, "_").toUpperCase();
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  const value: MoodifyContextValue = {
    currentEmotion,
    stableEmotion,
    weather,
    songs,
    songsLoading,
    songsError,
    refreshTrigger,
    currentSong,
    isPlaying,
    progress,
    duration,
    likedIds,
    setCurrentEmotion,
    setStableEmotion,
    discoverMusic,
    refreshSongs,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    toggleLike,
    formatLocation,
  };

  return <MoodifyContext.Provider value={value}>{children}</MoodifyContext.Provider>;
}

export function useMoodify() {
  const ctx = useContext(MoodifyContext);
  if (!ctx) throw new Error("useMoodify must be used within MoodifyProvider");
  return ctx;
}
