import * as faceapi from 'face-api.js';
import { Emotion } from '@shared/schema';

let modelsLoaded = false;

// Load face-api models
export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;
  
  try {
    // Load models from CDN
    const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    modelsLoaded = true;
    
    console.log('Face-API models loaded successfully');
  } catch (error) {
    console.error('Error loading face-api models:', error);
    throw error;
  }
}

// Detect face and emotion from webcam
export async function detectFace(
  videoElement: HTMLVideoElement
): Promise<{ emotion: Emotion; box: { top: number; left: number; width: number; height: number } } | null> {
  if (!modelsLoaded) {
    console.warn('Face detection models not loaded yet');
    return null;
  }
  
  try {
    // Detect faces with expressions
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    const result = await faceapi.detectSingleFace(videoElement, options)
      .withFaceLandmarks()
      .withFaceExpressions();
    
    if (!result) {
      return null;
    }
    
    // Get dominant expression
    const expressions = result.expressions;
    const dominantExpression = Object.keys(expressions).reduce((a, b) => 
      expressions[a] > expressions[b] ? a : b
    );
    
    // Map face-api expressions to our emotion types
    let emotion: Emotion['emotion'];
    switch (dominantExpression) {
      case 'happy':
        emotion = 'happy';
        break;
      case 'sad':
        emotion = 'sad';
        break;
      case 'angry':
        emotion = 'angry';
        break;
      case 'neutral':
        emotion = 'neutral';
        break;
      case 'surprised':
        emotion = 'surprised';
        break;
      case 'fearful':
        emotion = 'fearful';
        break;
      case 'disgusted':
        emotion = 'disgusted';
        break;
      default:
        emotion = 'neutral';
    }
    
    // Get bounding box for face
    const box = result.detection.box;
    
    return {
      emotion: {
        emotion,
        probability: expressions[dominantExpression]
      },
      box: {
        top: box.top,
        left: box.left,
        width: box.width,
        height: box.height
      }
    };
  } catch (error) {
    console.error('Error during face detection:', error);
    return null;
  }
}
