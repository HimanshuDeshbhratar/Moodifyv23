import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Emotion, Song } from '@shared/schema';

interface SongRecommendationsProps {
  emotion: Emotion | null;
}

export default function SongRecommendations({ emotion }: SongRecommendationsProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  // Fetch song recommendations based on emotion
  const { data: songs, isLoading, isError, refetch } = useQuery<Song[]>({
    queryKey: [emotion ? `/api/spotify/recommendations/emotion/${emotion.emotion}` : null],
    enabled: !!emotion,
  });

  // Handle play/pause button click
  const handlePlayClick = (song: Song) => {
    if (!song.previewUrl) {
      toast({
        title: "Preview unavailable",
        description: "No preview available for this track",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying === song.id) {
      // Pause current track
      audioRef?.pause();
      setIsPlaying(null);
    } else {
      // Stop current audio if playing
      if (audioRef) {
        audioRef.pause();
      }
      
      // Play new track
      const audio = new Audio(song.previewUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback error",
          description: "Unable to play preview",
          variant: "destructive"
        });
      });
      
      // Set up ended event
      audio.addEventListener('ended', () => {
        setIsPlaying(null);
      });
      
      setAudioRef(audio);
      setIsPlaying(song.id);
    }
  };

  // Get emotion label for song card
  const getEmotionLabel = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'Happy Vibes';
      case 'sad': return 'Melancholy';
      case 'angry': return 'Intense';
      case 'neutral': return 'Balanced';
      default: return 'Mood Match';
    }
  };

  // Get emotion color class for badge
  const getEmotionColorClass = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-[#FFD700]/30';
      case 'sad': return 'bg-[#4B6CBF]/30';
      case 'angry': return 'bg-[#E54B4B]/30';
      case 'neutral': return 'bg-[#9B9B9B]/30';
      default: return 'bg-gray-500/30';
    }
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          Recommended for your mood
        </h2>
        
        <Button 
          variant="ghost"
          onClick={handleRefresh}
          className="text-[#1DB954] hover:text-[#1ED760] transition flex items-center gap-1"
          disabled={isLoading || !emotion}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </Button>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="py-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1DB954] mb-4"></div>
          <p className="text-gray-400">Finding the perfect songs for your mood...</p>
        </div>
      )}
      
      {/* No emotion detected yet */}
      {!emotion && !isLoading && (
        <div className="py-12 text-center bg-gray-900/50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No emotion detected yet</h3>
          <p className="text-gray-400 mb-4">Look at the camera so we can analyze your mood and suggest songs</p>
        </div>
      )}
      
      {/* Error State */}
      {isError && (
        <div className="py-12 text-center bg-gray-900/50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">Failed to load recommendations</h3>
          <p className="text-gray-400 mb-4">There was an error fetching song recommendations</p>
          <Button 
            onClick={handleRefresh}
            className="bg-[#1DB954] hover:bg-[#1ED760] text-white font-medium py-2 px-6 rounded-full transition"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* No Results State */}
      {!isLoading && songs && songs.length === 0 && (
        <div className="py-12 text-center bg-gray-900/50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold mb-2">No songs found</h3>
          <p className="text-gray-400 mb-4">We couldn't find songs that match your current mood</p>
          <Button 
            onClick={handleRefresh}
            className="bg-[#1DB954] hover:bg-[#1ED760] text-white font-medium py-2 px-6 rounded-full transition"
          >
            Try Again
          </Button>
        </div>
      )}
      
      {/* Song Recommendations Grid */}
      {!isLoading && songs && songs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {songs.map((song) => (
            <div key={song.id} className="song-card bg-gray-900/80 hover:bg-gray-800/80 transition rounded-lg overflow-hidden">
              <div className="w-full aspect-square relative">
                {song.imageUrl ? (
                  <img 
                    src={song.imageUrl} 
                    alt={`${song.name} album cover`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{song.name}</h3>
                <p className="text-gray-400 text-sm truncate mb-3">{song.artist}</p>
                <div className="flex justify-between items-center">
                  <span className={`text-xs ${getEmotionColorClass(song.emotion)} text-white/90 px-2 py-1 rounded-full`}>
                    {getEmotionLabel(song.emotion)}
                  </span>
                  <Button
                    className={`text-white ${isPlaying === song.id ? 'bg-[#1ED760]' : 'bg-[#1DB954] hover:bg-[#1ED760]'} rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors`}
                    onClick={() => handlePlayClick(song)}
                  >
                    {isPlaying === song.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
