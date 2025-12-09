import { useState } from "react";
import { StartScreen } from "@/components/game/StartScreen";
import { GameInterface } from "@/components/game/GameInterface";

export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Global CRT Effects */}
      <div className="scanlines" />
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-20 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]" />

      {/* View Switcher */}
      {gameStarted ? (
        <GameInterface onLogout={() => setGameStarted(false)} />
      ) : (
        <StartScreen onStart={() => setGameStarted(true)} />
      )}
    </div>
  );
}
