import { useState } from "react";
import { StartScreen } from "@/components/game/StartScreen";
import { GameInterface } from "@/components/game/GameInterface";
import { BootSequence } from "@/components/game/BootSequence";
import { CrashScreen } from "@/components/game/CrashScreen";

type GameState = "BOOT" | "START" | "RUNNING" | "CRASH";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("BOOT");

  const handleBootComplete = () => {
    setGameState("START");
  };

  const handleStartGame = () => {
    setGameState("RUNNING");
  };

  const handleLogout = () => {
    setGameState("CRASH");
  };

  const handleCrashComplete = () => {
    setGameState("BOOT");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global CRT Effects */}
      <div className="scanlines" />
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]" />

      {/* State Manager */}
      {gameState === "BOOT" && <BootSequence onComplete={handleBootComplete} />}
      {gameState === "START" && <StartScreen onStart={handleStartGame} />}
      {gameState === "RUNNING" && <GameInterface onLogout={handleLogout} />}
      {gameState === "CRASH" && <CrashScreen onComplete={handleCrashComplete} />}
    </div>
  );
}
