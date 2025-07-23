import { useState, useEffect, useRef, useCallback } from "react";

interface DetectedHit {
  time: number;
  frequency: number;
  amplitude: number;
  isHiHat: boolean;
}

interface UseMicrophoneDetectionProps {
  isListening: boolean;
  onHitDetected: (hit: DetectedHit) => void;
}

export const useMicrophoneDetection = ({
  isListening,
  onHitDetected
}: UseMicrophoneDetectionProps) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastHitTimeRef = useRef<number>(0);

  const initializeMicrophone = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });
      
      setAudioStream(stream);
      setHasPermission(true);
      
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioContext = audioContextRef.current;
      
      // Create analyser
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;
      analyserRef.current.smoothingTimeConstant = 0.85;
      
      // Connect source to analyser
      sourceRef.current = audioContext.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not available");
      setHasPermission(false);
    }
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isListening) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const frequencyData = new Float32Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    analyser.getFloatFrequencyData(frequencyData);
    
    // Simple onset detection based on amplitude spike
    const currentTime = Date.now();
    const timeSinceLastHit = currentTime - lastHitTimeRef.current;
    
    // Calculate RMS (Root Mean Square) for amplitude detection
    let rms = 0;
    for (let i = 0; i < bufferLength; i++) {
      rms += dataArray[i] * dataArray[i];
    }
    rms = Math.sqrt(rms / bufferLength);
    
    // Calculate dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const dominantFrequency = (maxIndex * sampleRate) / (bufferLength * 2);
    
    // Detect hit based on amplitude threshold and timing
    const amplitudeThreshold = 30; // Adjust based on testing
    const minTimeBetweenHits = 50; // Minimum 50ms between hits
    
    if (rms > amplitudeThreshold && timeSinceLastHit > minTimeBetweenHits) {
      // Classify instrument based on frequency characteristics
      const isHiHat = dominantFrequency > 5000;
      
      const hit: DetectedHit = {
        time: currentTime / 1000, // Convert to seconds
        frequency: dominantFrequency,
        amplitude: rms / 255, // Normalize to 0-1
        isHiHat
      };
      
      onHitDetected(hit);
      lastHitTimeRef.current = currentTime;
    }
    
    // Continue analyzing
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isListening, onHitDetected]);

  // Start/stop audio analysis based on isListening
  useEffect(() => {
    if (isListening && hasPermission && analyserRef.current) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isListening, hasPermission, analyzeAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [audioStream]);

  return {
    hasPermission,
    error,
    initializeMicrophone,
    audioStream
  };
};