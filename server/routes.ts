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
      
      // Map emotions to search queries with stronger focus on Hindi and Bollywood music
      let searchQuery = '';
      
      switch (emotion) {
        case 'happy':
          searchQuery = 'bollywood hindi happy songs arijit neha kakkar';
          break;
        case 'sad':
          searchQuery = 'bollywood hindi sad songs arijit kumar sanu';
          break;
        case 'angry':
          searchQuery = 'bollywood hindi powerful songs';
          break;
        case 'neutral':
          searchQuery = 'bollywood hindi melodious songs';
          break;
        case 'surprised':
          searchQuery = 'bollywood hindi upbeat songs';
          break;
        case 'fearful':
          searchQuery = 'bollywood hindi soothing songs';
          break;
        case 'disgusted':
          searchQuery = 'bollywood hindi atmospheric songs';
          break;
        default:
          searchQuery = 'latest bollywood hindi songs';
      }
      
      console.log(`Getting recommendations for emotion: ${emotion} with query: ${searchQuery}`);
      
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
      console.log('Successfully obtained Spotify access token');
      
      // Try searching instead of recommendations API
      // This is a fallback mechanism as the recommendations API is having issues
      // Request more tracks (20) so we can filter for ones with previews
      // Use the search query directly with market=IN to find Hindi/Bollywood songs
      // Include a higher limit to get more tracks to choose from
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=30&market=IN`;
      console.log(`Searching Spotify: ${searchUrl}`);
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`Spotify search error (status ${searchResponse.status}):`, errorText);
        
        // Try to parse error response if it's JSON
        let errorMessage = 'Failed to search Spotify';
        try {
          const errorJSON = JSON.parse(errorText);
          if (errorJSON.error && errorJSON.error.message) {
            errorMessage = `Spotify API error: ${errorJSON.error.message}`;
            console.error('Parsed error:', errorJSON);
          }
        } catch (e) {
          // Not JSON, use text as is
        }
        
        return res.status(500).json({ message: errorMessage });
      }
      
      const searchData = await searchResponse.json() as { 
        tracks: { 
          items: Array<{
            id: string;
            name: string;
            artists: Array<{ name: string }>;
            album: { name: string; images: Array<{ url: string }> };
            preview_url: string | null;
          }>
        } 
      };
      
      console.log(`Retrieved ${searchData.tracks.items.length} tracks from Spotify search`);
      
      // Filter tracks to prioritize ones with preview URLs and take only up to 8
      const filteredTracks = searchData.tracks.items
        .filter(track => track.preview_url)
        .slice(0, 8);
        
      // If we have no tracks with previews, fall back to all tracks
      const tracksToUse = filteredTracks.length > 0 ? 
        filteredTracks : 
        searchData.tracks.items.slice(0, 8);
      
      console.log(`Found ${filteredTracks.length} tracks with previews`);
      
      // Transform the data to match our schema
      const songs = tracksToUse.map((track) => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        imageUrl: track.album.images[0]?.url || '',
        previewUrl: track.preview_url || '',
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
      
      const weatherData = await weatherResponse.json() as {
        main: { temp: number };
        weather: Array<{ main: string; icon: string }>;
        name: string;
      };
      
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