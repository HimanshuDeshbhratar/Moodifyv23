import React, { useState, useEffect } from 'react';
import WebcamSection from '@/components/WebcamSection';
import MoodInformation from '@/components/MoodInformation';
import SongRecommendations from '@/components/SongRecommendations';
import WeatherWidget from '@/components/WeatherWidget';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Emotion, Weather } from '@shared/schema';

export default function Home() {
  const { toast } = useToast();
  const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
  const [stableEmotion, setStableEmotion] = useState<Emotion | null>(null);
  const [weatherLocation, setWeatherLocation] = useState<string | null>(null);
  const [manualRefreshTrigger, setManualRefreshTrigger] = useState(0);

  // Get user's location for weather data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setWeatherLocation(`lat=${latitude}&lon=${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWeatherLocation("city=New York"); // Default fallback
          toast({
            title: "Location access denied",
            description: "Using default location for weather data.",
            variant: "destructive"
          });
        }
      );
    } else {
      setWeatherLocation("city=New York"); // Default fallback
      toast({
        title: "Geolocation not supported",
        description: "Using default location for weather data.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Fetch weather data
  const { data: weatherData } = useQuery<Weather>({
    queryKey: [weatherLocation ? `/api/weather?${weatherLocation}` : null],
    enabled: !!weatherLocation,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Handle emotion detection from webcam
  const handleEmotionDetected = (emotion: Emotion) => {
    setCurrentEmotion(emotion);
  };
  
  // Handle stable emotion detection for song recommendations
  const handleStableEmotionDetected = (emotion: Emotion) => {
    setStableEmotion(emotion);
  };
  
  // Handle manual refresh of recommendations
  const handleManualRefresh = () => {
    if (stableEmotion) {
      setManualRefreshTrigger(prev => prev + 1);
      toast({
        title: "Refreshing recommendations",
        description: `Getting new ${stableEmotion.emotion} songs for you!`,
        duration: 2000
      });
    } else if (currentEmotion) {
      // Use current emotion if no stable emotion detected yet
      setStableEmotion(currentEmotion);
      setManualRefreshTrigger(prev => prev + 1);
      toast({
        title: "Refreshing recommendations",
        description: `Getting ${currentEmotion.emotion} songs based on your current mood!`,
        duration: 2000
      });
    } else {
      toast({
        title: "No emotion detected",
        description: "Please look at the camera to detect your mood first.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#191414] to-[#0D0D0D] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#1DB954] rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Moodify</h1>
            </div>
            
            {weatherData && <WeatherWidget weather={weatherData} />}
          </div>
          
          <p className="text-gray-400 mt-2 text-center md:text-left">Experience music that matches your mood and weather</p>
        </header>

        {/* Main Content */}
        <main>
          {/* Webcam and Emotion Detection Section */}
          <section className="mb-12">
            <div className="flex flex-col lg:flex-row gap-8">
              <WebcamSection 
                onEmotionDetected={handleEmotionDetected} 
                onStableEmotionDetected={handleStableEmotionDetected}
              />
              <MoodInformation currentMood={currentEmotion} stableEmotion={stableEmotion} />
            </div>
          </section>

          <SongRecommendations 
            emotion={stableEmotion || currentEmotion} 
            onManualRefresh={handleManualRefresh}
            refreshTrigger={manualRefreshTrigger}
          />
        </main>

        {/* Footer Section */}
        <footer className="mt-12 pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>Powered by Spotify API, Face-API.js and OpenWeather API</p>
          <p className="mt-2">© {new Date().getFullYear()} Moodify - All emotions welcome</p>
        </footer>
      </div>
    </div>
  );
}
