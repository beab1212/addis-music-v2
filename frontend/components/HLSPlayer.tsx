'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface HLSPlayerProps {
  src: string;
  autoPlay?: boolean;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  volume?: number;
  isPlaying?: boolean;
}

export const HLSPlayer = ({ src, autoPlay, onTimeUpdate, onDurationChange, volume = 70, isPlaying }: HLSPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) audio.play();
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS Error:', data);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = src;
      if (autoPlay) audio.play();
    }
  }, [src, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
      onDurationChange={(e) => onDurationChange?.(e.currentTarget.duration)}
    />
  );
};
