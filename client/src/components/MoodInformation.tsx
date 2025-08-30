import React from 'react';
import type { Emotion } from '@shared/schema';

interface MoodInformationProps {
  currentMood: Emotion | null;
  stableEmotion?: Emotion | null;
}

export default function MoodInformation({ currentMood, stableEmotion }: MoodInformationProps) {
  // Get emotion-specific content
  const getMoodInfo = () => {
    if (!currentMood) return null;
    
    switch (currentMood.emotion) {
      case 'happy':
        return {
          description: "You're feeling cheerful and optimistic! We'll suggest upbeat, energetic songs that complement your mood.",
          genres: ['Pop', 'Dance', 'Summer hits'],
          color: 'border-[#FFD700] bg-[#FFD700]/10'
        };
      case 'sad':
        return {
          description: "You seem a bit down today. We'll find some melodic, comforting tunes that might help lift your spirits.",
          genres: ['Ballads', 'Acoustic', 'Indie'],
          color: 'border-[#4B6CBF] bg-[#4B6CBF]/10'
        };
      case 'angry':
        return {
          description: "You're feeling intense! We'll suggest tracks with powerful beats and energy to help you express yourself.",
          genres: ['Rock', 'Metal', 'Punk'],
          color: 'border-[#E54B4B] bg-[#E54B4B]/10'
        };
      case 'neutral':
        return {
          description: "You're in a balanced state of mind. We'll recommend a mix of relaxing and moderately upbeat tracks.",
          genres: ['Alternative', 'Ambient', 'Indie Pop'],
          color: 'border-[#9B9B9B] bg-[#9B9B9B]/10'
        };
      case 'surprised':
        return {
          description: "You look surprised! We'll find some unexpected and exciting tracks to match your mood.",
          genres: ['Electronic', 'Experimental', 'Future Bass'],
          color: 'border-[#9B9B9B] bg-[#9B9B9B]/10'
        };
      case 'fearful':
        return {
          description: "You seem a bit anxious. We'll recommend some calming and reassuring music to help you relax.",
          genres: ['Ambient', 'Classical', 'Lo-fi'],
          color: 'border-[#9B9B9B] bg-[#9B9B9B]/10'
        };
      case 'disgusted':
        return {
          description: "You're not impressed! We'll find some refreshing and cleansing tracks to reset your mood.",
          genres: ['Jazz', 'Classical', 'Instrumental'],
          color: 'border-[#9B9B9B] bg-[#9B9B9B]/10'
        };
      default:
        return {
          description: "We're analyzing your mood to suggest the perfect tracks.",
          genres: ['Various'],
          color: 'border-gray-500 bg-gray-500/10'
        };
    }
  };

  const moodInfo = getMoodInfo();

  return (
    <div className="w-full lg:w-1/3">
      <div className="bg-gray-900/50 rounded-xl p-4 h-full">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Mood Analysis
        </h2>
        
        {currentMood && moodInfo ? (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${moodInfo.color}`}>
            <h3 className="font-semibold text-lg mb-2">Your Mood: {currentMood.emotion.charAt(0).toUpperCase() + currentMood.emotion.slice(1)}</h3>
            <p className="text-white/80 text-sm mb-4">
              {moodInfo.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {moodInfo.genres.map((genre, index) => (
                <span key={index} className={`${moodInfo.color.replace('border-', 'bg-').replace('/10', '/20')} text-white/90 px-3 py-1 rounded-full text-xs`}>
                  {genre}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-gray-800/50 p-4 rounded-lg border-l-4 border-gray-600">
            <h3 className="font-semibold text-lg mb-2">Waiting for mood detection</h3>
            <p className="text-white/80 text-sm">
              Look at the camera so we can analyze your mood and suggest appropriate music.
            </p>
          </div>
        )}
        
        {/* Stable Emotion Indicator */}
        {stableEmotion && (
          <div className="mb-6 bg-[#1DB954]/10 border border-[#1DB954] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#1DB954]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-medium text-[#1DB954]">Stable Mood Detected</h4>
            </div>
            <p className="text-sm text-white/80">
              Music recommendations are based on your stable <strong>{stableEmotion.emotion}</strong> mood.
              Songs will update automatically when your mood changes consistently.
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-white/70 space-y-2">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>We analyze your facial expressions in real-time</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your emotion is detected using AI technology</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>We match your mood with suitable music</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1DB954] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Weather data adds context to recommendations</span>
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Privacy Note</h3>
          <p className="text-xs text-white/60">
            Your facial data is processed locally and never stored or sent to servers. We only use the detected emotion to match music.
          </p>
        </div>
      </div>
    </div>
  );
}
