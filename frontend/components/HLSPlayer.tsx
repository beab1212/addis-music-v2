'use client';
import { useEffect, useRef, memo } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/store/playerStore';


export const HLSPlayer = memo(() => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    muted,
    queue,
    currentTime,
    togglePlayPause,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    setVolume,
    setCurrentSong,
    setCurrentTime,
    setDuration,
  } = usePlayerStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.id) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true; // sends cookies
        },
      });
      hlsRef.current = hls;

      hls.loadSource(`http://localhost:5000/stream/${currentSong.id}/master.m3u8`);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // if (autoPlay) audio.play();
        if (true) audio.play();

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
      audio.src = `http://localhost:5000/stream/${currentSong.id}/master.m3u8`;
      // if (autoPlay) audio.play();
      if (true) audio.play();

    }
  }, [currentSong, "autoPlay"]);

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

  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 1) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);
  

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
      onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      loop={repeatMode === 'one'}
      muted={muted}
      onEnded={() => {
        if (repeatMode === 'all' && queue.length > 0 && currentSong) {
          playNext();
        } else if (repeatMode === 'off') {
          togglePlayPause();
        }
      }}
    />
  );
});
