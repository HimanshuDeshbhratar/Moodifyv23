# API Setup Instructions for EmotionMelody

## 🔑 Required API Keys

To run EmotionMelody successfully, you need to obtain API keys from the following services:

### 1. Spotify API (Required for Music Recommendations)

#### Steps to get Spotify API credentials:

1. **Go to Spotify Developer Dashboard:**
   - Visit: https://developer.spotify.com/dashboard/applications
   - Log in with your Spotify account (create one if you don't have it)

2. **Create a New Application:**
   - Click "Create App"
   - Fill in the form:
     - **App Name**: EmotionMelody
     - **App Description**: Music recommendation based on emotion detection
     - **Website**: http://localhost:5000 (for development)
     - **Redirect URI**: http://localhost:5000/callback (not used but required)
   - Agree to terms and click "Create"

3. **Get Your Credentials:**
   - Click on your newly created app
   - Click "Show Client Secret"
   - Copy your **Client ID** and **Client Secret**

4. **Update .env file:**
   ```env
   SPOTIFY_CLIENT_ID=your_actual_client_id_here
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret_here
   ```

### 2. OpenWeather API (Required for Weather Widget)

#### Steps to get OpenWeather API key:

1. **Go to OpenWeather API:**
   - Visit: https://openweathermap.org/api
   - Click "Sign Up" to create a free account

2. **Get Free API Key:**
   - After signing up, go to your API keys section
   - Copy the default API key (or create a new one)
   - Free tier allows 1000 calls/day (more than enough for development)

3. **Update .env file:**
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

## 🔧 Complete .env File Example

After getting both API keys, your `.env` file should look like this:

```env
# Spotify API Credentials
SPOTIFY_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
SPOTIFY_CLIENT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0

# OpenWeather API Key
OPENWEATHER_API_KEY=abcd1234efgh5678ijkl9012mnop3456

# Database URL (optional for basic functionality)
DATABASE_URL=your_database_url_here
```

## ⚠️ Important Notes

1. **Keep your API keys secret!** Never commit them to version control
2. **Free API limits:**
   - Spotify: No daily limit for search (plenty for development)
   - OpenWeather: 1000 calls/day (more than enough)

## 🚀 After Setting Up API Keys

1. **Restart the development server:**
   ```bash
   npm run dev
   ```

2. **Test the application:**
   - Open http://localhost:5000
   - Allow camera permissions
   - Look at the camera to detect emotions
   - Songs should now load and weather widget should appear

## 🐛 Troubleshooting

### If you get "API credentials not configured" error:
- Check that your `.env` file is in the project root
- Ensure there are no spaces around the `=` sign
- Verify the API keys are correct (no extra spaces or quotes)
- Restart the server after updating `.env`

### If songs still don't load:
- Check browser console for specific error messages
- Verify your Spotify app is not in restricted mode
- Make sure you didn't add quotes around the API keys in .env

### If weather doesn't load:
- Check that your OpenWeather API key is activated (can take 10 minutes)
- Verify the API key is correct
- Allow location permissions in your browser

## 💡 Alternative Testing (Without API Keys)

If you want to test the emotion detection without API keys, the face detection and emotion recognition will still work - you just won't get music recommendations or weather data.

## 🔒 Security Best Practices

1. **Never share your API keys publicly**
2. **Use different keys for production vs development**
3. **Regularly rotate your API keys**
4. **Monitor your API usage to detect any unusual activity**
