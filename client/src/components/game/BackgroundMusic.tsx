import { useEffect, useRef } from "react";

/**
 * Plays looping background music from /arcade.wav after the first user gesture.
 * Keeps playing across screens since it's mounted at the page level.
 */
interface BackgroundMusicProps {
  volume?: number; // 0.0 - 1.0
  muted?: boolean;
}

export function BackgroundMusic({ volume = 0.25, muted = false }: BackgroundMusicProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) return;
    const audio = new Audio("/arcade.wav");
    audio.loop = true;
    audio.volume = volume;
    audio.muted = muted;
    audioRef.current = audio;

    // Try to start immediately; if blocked, fall back to first gesture.
    const tryPlay = () => audio.play().catch(() => {});
    const startOnGesture = () => {
      tryPlay();
    };

    tryPlay();
    window.addEventListener("click", startOnGesture, { once: true });
    window.addEventListener("keydown", startOnGesture, { once: true });

    return () => {
      window.removeEventListener("click", startOnGesture);
      window.removeEventListener("keydown", startOnGesture);
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
    };
  }, []); // init once

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  return null;
}

