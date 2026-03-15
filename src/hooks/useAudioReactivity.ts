import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioData {
  frequencies: Uint8Array;
  waveform: Uint8Array;
  bass: number;
  mid: number;
  treble: number;
  volume: number;
  beat: boolean;
}

interface UseAudioReactivityOptions {
  enabled?: boolean;
  fftSize?: number;
  smoothing?: number;
  beatThreshold?: number;
}

export const useAudioReactivity = ({
  enabled = true,
  fftSize = 256,
  smoothing = 0.8,
  beatThreshold = 0.7,
}: UseAudioReactivityOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [audioData, setAudioData] = useState<AudioData>({
    frequencies: new Uint8Array(fftSize / 2),
    waveform: new Uint8Array(fftSize / 2),
    bass: 0,
    mid: 0,
    treble: 0,
    volume: 0,
    beat: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();
  const prevVolumeRef = useRef(0);
  const beatCooldownRef = useRef(false);

  const startListening = useCallback(async () => {
    if (!enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = fftSize;
      analyserRef.current.smoothingTimeConstant = smoothing;

      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      setIsListening(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasPermission(false);
    }
  }, [enabled, fftSize, smoothing]);

  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsListening(false);
  }, []);

  useEffect(() => {
    if (!isListening || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const waveformData = new Uint8Array(bufferLength);

    const analyze = () => {
      analyser.getByteFrequencyData(frequencyData);
      analyser.getByteTimeDomainData(waveformData);

      // Calculate frequency bands
      const bassEnd = Math.floor(bufferLength * 0.1);
      const midEnd = Math.floor(bufferLength * 0.5);

      let bassSum = 0, midSum = 0, trebleSum = 0;
      for (let i = 0; i < bufferLength; i++) {
        if (i < bassEnd) bassSum += frequencyData[i];
        else if (i < midEnd) midSum += frequencyData[i];
        else trebleSum += frequencyData[i];
      }

      const bass = bassSum / (bassEnd * 255);
      const mid = midSum / ((midEnd - bassEnd) * 255);
      const treble = trebleSum / ((bufferLength - midEnd) * 255);
      
      // Calculate overall volume
      const volume = [...frequencyData].reduce((a, b) => a + b, 0) / (bufferLength * 255);

      // Beat detection
      let beat = false;
      if (volume > beatThreshold && volume > prevVolumeRef.current * 1.3 && !beatCooldownRef.current) {
        beat = true;
        beatCooldownRef.current = true;
        setTimeout(() => { beatCooldownRef.current = false; }, 150);
      }
      prevVolumeRef.current = volume;

      setAudioData({
        frequencies: frequencyData,
        waveform: waveformData,
        bass,
        mid,
        treble,
        volume,
        beat,
      });

      animationRef.current = requestAnimationFrame(analyze);
    };

    analyze();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, beatThreshold]);

  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return {
    audioData,
    isListening,
    hasPermission,
    startListening,
    stopListening,
  };
};
