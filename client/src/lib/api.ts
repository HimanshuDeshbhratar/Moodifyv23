import { apiRequest } from '@/lib/queryClient';
import { Emotion, Song, Weather } from '@shared/schema';

// Function to fetch song recommendations based on emotion
export async function getSongRecommendations(emotion: string): Promise<Song[]> {
  const res = await apiRequest(
    'GET',
    `/api/spotify/recommendations/emotion/${emotion}`,
  );
  return res.json();
}

// Function to fetch weather data
export async function getWeatherData(
  query: { lat: number; lon: number } | { city: string }
): Promise<Weather> {
  const queryParams = 'lat' in query 
    ? `lat=${query.lat}&lon=${query.lon}` 
    : `city=${query.city}`;
  
  const res = await apiRequest(
    'GET',
    `/api/weather?${queryParams}`,
  );
  return res.json();
}

// Function to search Spotify tracks
export async function searchSpotify(query: string, type = 'track', limit = 10): Promise<any> {
  const res = await apiRequest(
    'GET',
    `/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
  );
  return res.json();
}
