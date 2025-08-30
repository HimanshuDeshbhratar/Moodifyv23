import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // API Status endpoint for testing configuration
  app.get('/api/status', async (req, res) => {
    const status = {
      spotify: validateSpotifyCredentials(),
      weather: validateWeatherKey(),
      timestamp: new Date().toISOString()
    };
    
    console.log('API Status Check:', status);
    
    return res.json({
      message: 'API Configuration Status',
      services: {
        spotify: status.spotify ? '✅ Configured' : '❌ Missing credentials',
        weather: status.weather ? '✅ Configured' : '❌ Missing API key'
      },
      instructions: status.spotify && status.weather ? 
        'All APIs are configured correctly!' : 
        'Please check API_SETUP_INSTRUCTIONS.md for setup guide'
    });
  });
  
  // Environment variable validation
  const validateSpotifyCredentials = () => {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || clientId === 'your_spotify_client_id_here' || !clientSecret || clientSecret === 'your_spotify_client_secret_here') {
      return false;
    }
    return true;
  };
  
  const validateWeatherKey = () => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    return apiKey && apiKey !== 'your_openweather_api_key_here';
  };
  
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
      
      // Check if Spotify credentials are configured
      if (!validateSpotifyCredentials()) {
        console.error('Spotify credentials not configured');
        return res.status(500).json({ 
          message: 'Spotify API credentials not configured. Please check your .env file.',
          details: 'Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET'
        });
      }
      
      // Create diverse searches including both latest and classic songs
      const searchQueries = [];
      
      switch (emotion) {
        case 'happy':
          searchQueries.push(
            'bollywood hindi happy songs 2023 2024',  // Latest
            'classic bollywood happy songs 90s 2000s', // Classic
            'hindi upbeat dance songs arijit singh'    // Popular artists
          );
          break;
        case 'sad':
          searchQueries.push(
            'bollywood hindi sad songs 2023 2024',
            'classic hindi sad songs kumar sanu udit narayan',
            'hindi emotional songs arijit singh rahat'
          );
          break;
        case 'angry':
          searchQueries.push(
            'bollywood hindi intense songs 2023 2024',
            'classic hindi powerful songs 90s rock',
            'hindi motivational songs energetic'
          );
          break;
        case 'neutral':
          searchQueries.push(
            'bollywood hindi melodious songs 2023 2024',
            'classic hindi songs evergreen collection',
            'hindi chill songs lofi indian'
          );
          break;
        case 'surprised':
          searchQueries.push(
            'bollywood hindi upbeat songs 2023 2024',
            'classic hindi exciting songs energetic',
            'hindi party songs dance bollywood'
          );
          break;
        case 'fearful':
          searchQueries.push(
            'bollywood hindi soothing songs 2023 2024',
            'classic hindi calming songs peaceful',
            'hindi meditation relaxing instrumental'
          );
          break;
        case 'disgusted':
          searchQueries.push(
            'bollywood hindi atmospheric songs 2023 2024',
            'classic hindi moody songs deep',
            'hindi ambient instrumental peaceful'
          );
          break;
        default:
          searchQueries.push(
            'popular bollywood hindi songs 2023 2024',
            'classic hindi songs collection evergreen',
            'best bollywood songs all time'
          );
      }
      
      // Randomly select one search query for variety
      const searchQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
      console.log(`Selected search query: ${searchQuery}`);
      
      // Add randomization to get different results on refresh by adding random terms
      const randomTerms = ['popular', 'trending', 'hit', 'top', 'best', 'latest'];
      const finalQuery = `${searchQuery} ${randomTerms[Math.floor(Math.random() * randomTerms.length)]}`;
      console.log(`Final search query: ${finalQuery}`);
      
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
      
      // Use the enhanced search with randomization for better variety
      // Request more tracks (40) so we can filter for ones with previews
      // This increases our chances of finding playable content while maintaining variety
      const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(finalQuery)}&type=track&limit=40&market=IN`;
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
      
      // Check if Weather API key is configured
      if (!validateWeatherKey()) {
        console.error('OpenWeather API key not configured');
        return res.status(500).json({ 
          message: 'Weather API key not configured. Please check your .env file.',
          details: 'Missing OPENWEATHER_API_KEY'
        });
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