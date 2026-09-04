import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { detectFace, loadModels } from "@/lib/faceDetection";
import { useToast } from "@/hooks/use-toast";
import type { Emotion } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CameraFeedProps {
  onEmotionDetected: (emotion: Emotion) => void;
  onStableEmotionDetected?: (emotion: Emotion) => void;
  cameraLabel?: string;
  className?: string;
}

export default function CameraFeed({
  onEmotionDetected,
  onStableEmotionDetected,
  cameraLabel = "CAMERA STATE : AWAITING SIGNAL",
  className,
}: CameraFeedProps) {
  const { toast } = useToast();
  const webcamRef = useRef<Webcam>(null);
  const [cameraPermission, setCameraPermission] = useState<"not-granted" | "granted" | "denied">("not-granted");
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectedEmotion, setDetectedEmotion] = useState<Emotion | null>(null);
  const [stableEmotion, setStableEmotion] = useState<Emotion | null>(null);

  const emotionHistory = useRef<Emotion[]>([]);
  const lastStableEmotionTime = useRef<number>(0);
  const EMOTION_HISTORY_SIZE = 5;
  const STABLE_EMOTION_THRESHOLD = 3;
  const MIN_STABLE_INTERVAL = 8000;

  useEffect(() => {
    const setupModels = async () => {
      try {
        await loadModels();
        setIsModelLoading(false);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load face detection models",
          variant: "destructive",
        });
      }
    };
    setupModels();
  }, [toast]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setCameraPermission("granted");
    } catch {
      setCameraPermission("denied");
      toast({
        title: "Camera access denied",
        description: "Allow camera access to run neural assessment.",
        variant: "destructive",
      });
    }
  };

  const detectEmotion = async () => {
    if (isModelLoading || !webcamRef.current || cameraPermission !== "granted") return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    try {
      const detection = await detectFace(video);
      if (!detection) return;

      const { emotion } = detection;
      setDetectedEmotion(emotion);
      onEmotionDetected(emotion);

      emotionHistory.current.push(emotion);
      if (emotionHistory.current.length > EMOTION_HISTORY_SIZE) {
        emotionHistory.current.shift();
      }

      if (emotionHistory.current.length === EMOTION_HISTORY_SIZE) {
        const emotionCounts = emotionHistory.current.reduce((acc, curr) => {
          acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dominantEmotion = Object.entries(emotionCounts).find(
          ([, count]) => count >= STABLE_EMOTION_THRESHOLD
        );

        if (
          dominantEmotion &&
          Date.now() - lastStableEmotionTime.current >= MIN_STABLE_INTERVAL &&
          stableEmotion?.emotion !== dominantEmotion[0]
        ) {
          const newStableEmotion: Emotion = {
            emotion: dominantEmotion[0] as Emotion["emotion"],
            probability:
              emotionHistory.current
                .filter((e) => e.emotion === dominantEmotion[0])
                .reduce((sum, e) => sum + e.probability, 0) / dominantEmotion[1],
          };

          setStableEmotion(newStableEmotion);
          lastStableEmotionTime.current = Date.now();
          onStableEmotionDetected?.(newStableEmotion);
        }
      }
    } catch (error) {
      console.error("Error detecting face:", error);
    }
  };

  useEffect(() => {
    if (cameraPermission !== "granted" || isModelLoading) return;
    const intervalId = setInterval(detectEmotion, 1000);
    return () => clearInterval(intervalId);
  }, [cameraPermission, isModelLoading]);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative mx-auto w-full max-w-md aspect-square border border-lime bg-black">
        {/* Viewfinder corners */}
        <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-lime z-10 pointer-events-none" />
        <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-lime z-10 pointer-events-none" />
        <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-lime z-10 pointer-events-none" />
        <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-lime z-10 pointer-events-none" />

        {cameraPermission !== "granted" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4">
            <p className="font-mono text-xs text-moodify-muted-light tracking-wider uppercase">
              {cameraPermission === "denied" ? "CAMERA FEED DENIED" : "CAMERA FEED OFFLINE"}
            </p>
            <button
              type="button"
              onClick={requestCameraPermission}
              className="font-mono text-xs tracking-widest uppercase text-lime border border-lime px-5 py-3 hover:bg-lime hover:text-black transition-colors"
            >
              {cameraPermission === "denied" ? "RETRY ACCESS" : "ENABLE CAMERA"}
            </button>
          </div>
        )}

        {cameraPermission === "granted" && (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover"
            />
            {isModelLoading && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <p className="font-mono text-xs text-lime tracking-wider animate-pulse">
                  LOADING MODELS…
                </p>
              </div>
            )}
            {detectedEmotion && !isModelLoading && (
              <div className="absolute bottom-3 left-3 right-3 flex justify-center">
                <span className="font-mono text-[10px] tracking-widest text-lime bg-black/70 px-2 py-1 border border-lime/40">
                  {detectedEmotion.emotion.toUpperCase()} · {Math.round(detectedEmotion.probability * 100)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <p className="mt-3 text-center font-mono text-[11px] tracking-wider text-moodify-muted-light uppercase">
        {cameraLabel}
      </p>
    </div>
  );
}
