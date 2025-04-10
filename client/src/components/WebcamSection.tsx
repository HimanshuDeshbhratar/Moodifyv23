import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { detectFace, loadModels } from '@/lib/faceDetection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Emotion } from '@shared/schema';

interface WebcamSectionProps {
  onEmotionDetected: (emotion: Emotion) => void;
}

export default function WebcamSection({ onEmotionDetected }: WebcamSectionProps) {
  const { toast } = useToast();
  const webcamRef = useRef<Webcam>(null);
  const [cameraPermission, setCameraPermission] = useState<'not-granted' | 'granted' | 'denied'>('not-granted');
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [facePosition, setFacePosition] = useState<{ top: number, left: number, width: number, height: number } | null>(null);

  // Load face-api models on component mount
  useEffect(() => {
    const setupModels = async () => {
      try {
        await loadModels();
        setIsModelLoading(false);
        toast({
          title: "Face detection ready",
          description: "Models loaded successfully",
        });
      } catch (error) {
        console.error('Failed to load models', error);
        toast({
          title: "Error",
          description: "Failed to load face detection models",
          variant: "destructive"
        });
      }
    };
    
    setupModels();
  }, [toast]);

  // Request camera permission
  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Clean up the stream
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch (error) {
      console.error('Error getting camera permission:', error);
      setCameraPermission('denied');
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to use this feature",
        variant: "destructive"
      });
    }
  };

  // Detect face and emotion from webcam feed
  const detectEmotion = async () => {
    if (isModelLoading || !webcamRef.current || cameraPermission !== 'granted') return;
    
    const webcam = webcamRef.current;
    const video = webcam.video;
    
    if (!video || video.readyState !== 4) return;
    
    try {
      const detection = await detectFace(video);
      
      if (detection) {
        const { emotion, box } = detection;
        
        // Set detected emotion and face position
        setDetectedEmotion(emotion);
        
        // Calculate face position relative to webcam container
        if (video && box) {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          const displayWidth = video.clientWidth;
          const displayHeight = video.clientHeight;
          
          // Scale the box coordinates
          const scale = Math.min(displayWidth / videoWidth, displayHeight / videoHeight);
          const xOffset = (displayWidth - videoWidth * scale) / 2;
          const yOffset = (displayHeight - videoHeight * scale) / 2;
          
          setFacePosition({
            top: box.top * scale + yOffset,
            left: box.left * scale + xOffset,
            width: box.width * scale,
            height: box.height * scale
          });
        }
        
        // Pass emotion to parent component
        onEmotionDetected(emotion);
      } else {
        // No face detected
        console.log('No face detected');
      }
    } catch (error) {
      console.error('Error detecting face:', error);
    }
  };

  // Run emotion detection at regular intervals
  useEffect(() => {
    if (cameraPermission !== 'granted' || isModelLoading) return;
    
    const intervalId = setInterval(() => {
      detectEmotion();
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [cameraPermission, isModelLoading]);

  // Generate emotion color class based on detected emotion
  const getEmotionColorClass = () => {
    if (!detectedEmotion) return '';
    
    switch (detectedEmotion.emotion) {
      case 'happy': return 'bg-[#FFD700]';
      case 'sad': return 'bg-[#4B6CBF]';
      case 'angry': return 'bg-[#E54B4B]';
      case 'neutral': return 'bg-[#9B9B9B]';
      default: return 'bg-gray-400';
    }
  };

  // Get emotion emoji
  const getEmotionEmoji = () => {
    if (!detectedEmotion) return '';
    
    switch (detectedEmotion.emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'neutral': return '😐';
      case 'surprised': return '😮';
      case 'fearful': return '😨';
      case 'disgusted': return '🤢';
      default: return '🤔';
    }
  };

  return (
    <div className="w-full lg:w-2/3">
      <div className="bg-gray-900/50 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Face Detection
        </h2>
        
        <div className="camera-container relative">
          {/* Camera permission not granted state */}
          {cameraPermission === 'not-granted' && (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10h4.5a2.5 2.5 0 012.5 2.5v.5m0 5h-4l2-3.5M8.5 15H4a2.5 2.5 0 01-2.5-2.5v-.5m0-5h4l-2 3.5M7 10V5a2 2 0 012-2h6a2 2 0 012 2v5M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Camera access required</h3>
              <p className="text-gray-400 mb-4">We need camera access to detect your emotions and recommend songs</p>
              <Button 
                className="bg-[#1DB954] hover:bg-[#1ED760] text-white font-semibold py-2 px-6 rounded-full transition duration-300"
                onClick={requestCameraPermission}
              >
                Allow Camera Access
              </Button>
            </div>
          )}

          {/* Camera permission denied state */}
          {cameraPermission === 'denied' && (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Camera access denied</h3>
              <p className="text-gray-400 mb-4">Please enable camera access in your browser settings to use this feature</p>
              <Button 
                className="bg-[#1DB954] hover:bg-[#1ED760] text-white font-semibold py-2 px-6 rounded-full transition duration-300"
                onClick={requestCameraPermission}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Webcam view */}
          {cameraPermission === 'granted' && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "user"
                }}
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Face detection overlay */}
              {facePosition && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <div 
                    className={`border-2 border-[#1DB954] rounded-lg absolute transition-all duration-200`}
                    style={{
                      top: `${facePosition.top}px`,
                      left: `${facePosition.left}px`,
                      width: `${facePosition.width}px`,
                      height: `${facePosition.height}px`
                    }}
                  >
                    {detectedEmotion && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#1DB954] text-white px-3 py-1 rounded-full text-sm">
                        {detectedEmotion.emotion.charAt(0).toUpperCase() + detectedEmotion.emotion.slice(1)} {getEmotionEmoji()}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {isModelLoading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-t-2 border-[#1DB954] rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-white">Loading face detection models...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Emotion Status Bar */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-3">Current Mood</h3>
          
          {detectedEmotion ? (
            <div className="relative h-16">
              <div className={`absolute inset-0 bg-${detectedEmotion.emotion === 'happy' ? '[#FFD700]' : 
                               detectedEmotion.emotion === 'sad' ? '[#4B6CBF]' : 
                               detectedEmotion.emotion === 'angry' ? '[#E54B4B]' : 
                               '[#9B9B9B]'}/20 rounded-lg p-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getEmotionEmoji()}</span>
                  <div>
                    <h4 className="font-semibold">{detectedEmotion.emotion.charAt(0).toUpperCase() + detectedEmotion.emotion.slice(1)}</h4>
                    <p className="text-sm text-white/70">
                      {detectedEmotion.emotion === 'happy' ? 'Upbeat music coming your way!' :
                       detectedEmotion.emotion === 'sad' ? 'Comforting melodies for you' :
                       detectedEmotion.emotion === 'angry' ? 'Release that energy with intense tracks' :
                       'Balanced tunes for your neutral mood'}
                    </p>
                  </div>
                </div>
                <div className={`${getEmotionColorClass()} w-3 h-16 rounded-r-lg absolute top-0 right-0`}></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-700/50 rounded-lg h-16 flex items-center justify-center">
              <p className="text-gray-400">Waiting to detect your mood...</p>
            </div>
          )}
          
          <div className="flex justify-between mt-4 text-xs text-gray-400">
            <div className="flex items-center"><span className="w-2 h-2 bg-[#FFD700] rounded-full mr-1"></span> Happy</div>
            <div className="flex items-center"><span className="w-2 h-2 bg-[#4B6CBF] rounded-full mr-1"></span> Sad</div>
            <div className="flex items-center"><span className="w-2 h-2 bg-[#9B9B9B] rounded-full mr-1"></span> Neutral</div>
            <div className="flex items-center"><span className="w-2 h-2 bg-[#E54B4B] rounded-full mr-1"></span> Angry</div>
          </div>
        </div>
      </div>
    </div>
  );
}
