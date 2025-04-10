import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Spotify API endpoints
  app.get('/api/spotify/search', async (req, res) => {
    try {
      const { q, type = 'track', limit = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: 'Search query is required' });
      }
      
      // Get access token from Spotify
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Spotify token error:', error);
        return res.status(500).json({ message: 'Failed to authenticate with Spotify' });
      }
      
      const tokenData = await tokenResponse.json() as { access_token: string };
      
      // Search for tracks
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(q as string)}&type=${type}&limit=${limit}`, 
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        }
      );
      
      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error('Spotify search error:', error);
        return res.status(500).json({ message: 'Failed to search Spotify' });
      }
      
      const searchData = await searchResponse.json();
      return res.json(searchData);
      
    } catch (error) {
      console.error('Spotify API error:', error);
      return res.status(500).json({ message: 'An error occurred with the Spotify API' });
    }
  });
  
  // Route to get recommendations based on emotion
  app.get('/api/spotify/recommendations/emotion/:emotion', async (req, res) => {
    try {
      const { emotion } = req.params;
      
      if (!emotion) {
        return res.status(400).json({ message: 'Emotion is required' });
      }
      
      // Map emotions to Spotify attributes
      let searchParams = '';
      
      switch (emotion) {
        case 'happy':
          searchParams = 'genre=pop&min_energy=0.7&min_valence=0.7&target_tempo=120';
          break;
        case 'sad':
          searchParams = 'genre=piano,sad&max_energy=0.4&max_valence=0.4&target_tempo=90';
          break;
        case 'angry':
          searchParams = 'genre=rock,metal&min_energy=0.8&max_valence=0.4&target_tempo=140';
          break;
        case 'neutral':
          searchParams = 'genre=acoustic,ambient&target_energy=0.5&target_valence=0.5';
          break;
        default:
          searchParams = 'genre=pop';
      }
      
      // Get access token from Spotify
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials'
        })
      });
      
      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Spotify token error:', error);
        return res.status(500).json({ message: 'Failed to authenticate with Spotify' });
      }
      
      const tokenData = await tokenResponse.json() as { access_token: string };
      
      // Get recommendations
      const recommendationsResponse = await fetch(
        `https://api.spotify.com/v1/recommendations?${searchParams}&limit=8`, 
        {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`
          }
        }
      );
      
      if (!recommendationsResponse.ok) {
        const error = await recommendationsResponse.text();
        console.error('Spotify recommendations error:', error);
        return res.status(500).json({ message: 'Failed to get recommendations from Spotify' });
      }
      
      const recommendationsData = await recommendationsResponse.json();
      
      // Transform the data to match our schema
      const songs = recommendationsData.tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        imageUrl: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        emotion: emotion
      }));
      
      return res.json(songs);
      
    } catch (error) {
      console.error('Spotify recommendations error:', error);
      return res.status(500).json({ message: 'An error occurred with the Spotify API' });
    }
  });
  
  // Weather API endpoint
  app.get('/api/weather', async (req, res) => {
    try {
      const { lat, lon, city } = req.query;
      
      if ((!lat || !lon) && !city) {
        return res.status(400).json({ message: 'Either coordinates (lat, lon) or city name is required' });
      }
      
      let url = '';
      const apiKey = process.env.OPENWEATHER_API_KEY || '';
      
      if (lat && lon) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
      }
      
      const weatherResponse = await fetch(url);
      
      if (!weatherResponse.ok) {
        const error = await weatherResponse.text();
        console.error('Weather API error:', error);
        return res.status(500).json({ message: 'Failed to fetch weather data' });
      }
      
      const weatherData = await weatherResponse.json();
      
      // Transform weather data to match our schema
      const weather = {
        temperature: Math.round(weatherData.main.temp),
        condition: weatherData.weather[0].main,
        location: weatherData.name,
        icon: weatherData.weather[0].icon
      };
      
      return res.json(weather);
      
    } catch (error) {
      console.error('Weather API error:', error);
      return res.status(500).json({ message: 'An error occurred with the Weather API' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
