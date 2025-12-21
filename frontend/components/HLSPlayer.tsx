'use client';
import { useEffect, useRef, memo, useCallback } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/store/playerStore';

export const HLSPlayer = memo(() => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const adHlsRef = useRef<Hls | null>(null);
  const lastTimeUpdateRef = useRef(0);

  const {
    currentSong,
    isPlaying,
    volume,
    muted,
    repeatMode,
    queue,
    currentTime,
    togglePlayPause,
    playNext,
    setCurrentTime,
    setDuration,
    advertisementData,
    isAdvertisementPlaying,
    setIsAdvertisementPlaying,
    setAudioRef,
  } = usePlayerStore();

  // Track how much main content has been played (in seconds)
  const mainPlaybackTimeRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  const adInterval = advertisementData?.adIntervalSeconds ?? 120;
  const hasAds = !advertisementData?.isPremium && advertisementData?.adStreamUrl;

  // Reset currentTime when song changes
  useEffect(() => {
    if (currentSong?.id) {
      setCurrentTime(0);
    }
  }, [currentSong?.id, setCurrentTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      adHlsRef.current?.destroy();
    };
  }, []);

  // Accumulate main playback time
  useEffect(() => {
    if (!isPlaying || isAdvertisementPlaying || !hasAds) {
      return;
    }
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current !== null) {
        mainPlaybackTimeRef.current += (performance.now() - startTimeRef.current) / 1000;
        startTimeRef.current = null;
      }
    };
  }, [isPlaying, isAdvertisementPlaying, hasAds]);

  // Periodically check to trigger ads
  useEffect(() => {
    if (!isPlaying || isAdvertisementPlaying || !hasAds || startTimeRef.current === null) {
      return;
    }

    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      console.log('Elapsed main playback time:', mainPlaybackTimeRef.current + elapsed);
      if (mainPlaybackTimeRef.current + elapsed >= adInterval) {
        mainPlaybackTimeRef.current += elapsed;
        mainPlaybackTimeRef.current = 0; // reset
        startTimeRef.current = null;
        setIsAdvertisementPlaying(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isAdvertisementPlaying, hasAds, adInterval, setIsAdvertisementPlaying]);

  // Main stream loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.id || isAdvertisementPlaying) {
      hlsRef.current?.detachMedia();
      return;
    }

    if (Hls.isSupported()) {
      hlsRef.current?.destroy();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 60,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true;
        },
      });
      hlsRef.current = hls;

      // Use the provided mainStreamUrl if available, fallback to old path
      const streamUrl =
        advertisementData?.mainStreamUrl ||
        `http://localhost:5000/stream/${currentSong.id}/master.m3u8`;

      hls.loadSource(streamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.currentTime = currentTime;
        if (isPlaying) {
          audio.play().catch((e) => console.warn("Main play failed:", e));
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) console.error("HLS Main Error:", data);
      });
    } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
      audio.src =
        advertisementData?.mainStreamUrl ||
        `http://localhost:5000/stream/${currentSong.id}/master.m3u8`;
      audio.currentTime = currentTime;
      if (isPlaying) audio.play().catch((e) => console.warn("Native play failed:", e));
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [currentSong?.id, isAdvertisementPlaying, advertisementData?.mainStreamUrl]);

  // Advertisement stream loading
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAdvertisementPlaying || !hasAds) {
      adHlsRef.current?.destroy();
      adHlsRef.current = null;
      return;
    }

    // Pause and detach main stream
    audio.pause();
    hlsRef.current?.detachMedia();

    if (Hls.isSupported()) {
      adHlsRef.current?.destroy();

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        maxBufferLength: 60,
        xhrSetup: (xhr) => {
          xhr.withCredentials = true; // sends cookies
        },
      });
      adHlsRef.current = hls;

      hls.loadSource(advertisementData.adStreamUrl);
      hls.attachMedia(audio);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (isPlaying) {
          audio.play().catch((e) => {
            console.warn("Ad play failed:", e);
            setIsAdvertisementPlaying(false); // fallback
          });
        } else {
          setIsAdvertisementPlaying(false); // If not playing, don't start ad
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS Ad Error:", data);
          setIsAdvertisementPlaying(false);
        }
      });
    }

    return () => {
      adHlsRef.current?.destroy();
      adHlsRef.current = null;
    };
  }, [isAdvertisementPlaying, advertisementData?.adStreamUrl, hasAds, setIsAdvertisementPlaying]);

  // Handle end of audio (song or ad)
  const handleEnded = useCallback(() => {
    if (isAdvertisementPlaying) {
      // Ad finished → resume main playback
      setIsAdvertisementPlaying(false);
    } else {
      // Main song ended
      if (repeatMode === "one") {
        // loop handled by <audio loop>
      } else if (repeatMode === "all" && queue.length > 0) {
        playNext();
      } else {
        togglePlayPause(); // pause at end
      }
    }
  }, [
    isAdvertisementPlaying,
    repeatMode,
    queue.length,
    playNext,
    togglePlayPause,
    setIsAdvertisementPlaying,
  ]);

  // Volume & mute sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Seek sync
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isAdvertisementPlaying && Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime;
    }
  }, [currentTime, isAdvertisementPlaying]);

  // External play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => console.warn("External play failed:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, isAdvertisementPlaying]);

  // set audioRef in store
  useEffect(() => {
    if (audioRef.current && !isAdvertisementPlaying) {
      setAudioRef(audioRef.current);
    }
  }, [audioRef.current, setAudioRef]);

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={(e) => {
        const now = Date.now();
        if (!isAdvertisementPlaying && now - lastTimeUpdateRef.current >= 500) {
          setCurrentTime(e.currentTarget.currentTime);
          lastTimeUpdateRef.current = now;
        }
      }}
      onDurationChange={(e) => !isAdvertisementPlaying && setDuration(e.currentTarget.duration)}
      onEnded={handleEnded}
      loop={repeatMode === "one"}
      preload="auto"
    />
  );
});
