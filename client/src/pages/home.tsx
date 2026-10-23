import { useEffect, useState } from "react";
import { StartScreen } from "@/components/game/StartScreen";
import { GameInterface } from "@/components/game/GameInterface";
import { BootSequence } from "@/components/game/BootSequence";
import { CrashScreen } from "@/components/game/CrashScreen";
import { BackgroundMusic } from "@/components/game/BackgroundMusic";
import {
  AUDIO_PREFS_KEY,
  BOOT_SEEN_KEY,
  markBootSeen,
  readAudioPrefs,
  readBootSeen,
  writeAudioPrefs,
} from "@/lib/releaseState";

type GameState = "BOOT" | "START" | "RUNNING" | "CRASH";

function loadAudio() {
  if (typeof localStorage === "undefined") return { muted: false, volume: 0.25 };
  return readAudioPrefs(() => localStorage.getItem(AUDIO_PREFS_KEY));
}

function seenBoot() {
  if (typeof localStorage === "undefined") return false;
  return readBootSeen(() => localStorage.getItem(BOOT_SEEN_KEY));
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(() => (seenBoot() ? "START" : "BOOT"));
  const [musicMuted, setMusicMuted] = useState(() => loadAudio().muted);
  const [musicVolume, setMusicVolume] = useState(() => loadAudio().volume);

  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    writeAudioPrefs((value) => localStorage.setItem(AUDIO_PREFS_KEY, value), {
      muted: musicMuted,
      volume: musicVolume,
    });
  }, [musicMuted, musicVolume]);

  const handleBootComplete = () => {
    if (typeof localStorage !== "undefined") {
      markBootSeen((value) => localStorage.setItem(BOOT_SEEN_KEY, value));
    }
    setGameState("START");
  };

  const handleStartGame = () => {
    setGameState("RUNNING");
  };

  const handleLogout = () => {
    setGameState("CRASH");
  };

  const handleCrashComplete = () => {
    setGameState(seenBoot() ? "START" : "BOOT");
  };

  return (
    <div className="min-h-dvh bg-background relative overflow-x-hidden">
      {(gameState === "START" || gameState === "RUNNING") && (
        <BackgroundMusic muted={musicMuted} volume={musicVolume} />
      )}
      <div className="scanlines" />
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]" />

      {gameState === "BOOT" && <BootSequence onComplete={handleBootComplete} />}
      {gameState === "START" && <StartScreen onStart={handleStartGame} />}
      {gameState === "RUNNING" && (
        <GameInterface
          onLogout={handleLogout}
          musicMuted={musicMuted}
          musicVolume={musicVolume}
          onToggleMute={() => setMusicMuted((m) => !m)}
          onVolumeChange={(v) => setMusicVolume(v)}
        />
      )}
      {gameState === "CRASH" && <CrashScreen onComplete={handleCrashComplete} />}
    </div>
  );
}
