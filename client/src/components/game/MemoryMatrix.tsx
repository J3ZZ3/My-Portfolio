import { useState, useRef } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPanel } from "./LeaderboardPanel";
import {
  LeaderboardQualifyModal,
  LeaderboardCongratsBanner,
} from "./LeaderboardQualifyModal";
import type { GameId } from "@/lib/leaderboard";

const GRID_SIZE = 4;
const INITIAL_SEQUENCE_LENGTH = 3;

interface MemoryMatrixProps {
  gameId?: GameId;
}

export function MemoryMatrix({ gameId = "memory" }: MemoryMatrixProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const {
    entries,
    loading,
    qualifyScore,
    showQualifyModal,
    congratsMessage,
    submitting,
    checkQualify,
    submitName,
    skipQualify,
    dismissCongrats,
  } = useLeaderboard(gameId);

  const checkQualifyRef = useRef(checkQualify);
  checkQualifyRef.current = checkQualify;

  const generateSequence = (length: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayerTurn(false);
    setStatusMessage("WATCH PATTERN");

    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setHighlightedTile(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setHighlightedTile(null);
    }

    setIsPlayerTurn(true);
    setStatusMessage("REPEAT PATTERN");
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    const newSequence = generateSequence(INITIAL_SEQUENCE_LENGTH);
    setSequence(newSequence);
    setPlayerSequence([]);
    playSequence(newSequence);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || !isPlayerTurn || gameOver) return;

    setHighlightedTile(index);
    setTimeout(() => setHighlightedTile(null), 200);

    const newPlayerSequence = [...playerSequence, index];
    setPlayerSequence(newPlayerSequence);

    if (sequence[newPlayerSequence.length - 1] !== index) {
      setGameOver(true);
      setHighScore((prev) => Math.max(prev, score));
      setStatusMessage("SYSTEM FAILURE");
      setIsPlaying(false);
      void checkQualifyRef.current(score);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      setPlayerSequence([]);
      setIsPlayerTurn(false);
      setStatusMessage("SUCCESS - LEVEL UP");

      setTimeout(() => {
        const nextSequence = [...sequence, Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE))];
        setSequence(nextSequence);
        playSequence(nextSequence);
      }, 1000);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud overflow-y-auto p-2">
      <LeaderboardCongratsBanner message={congratsMessage} onDismiss={dismissCongrats} />
      <LeaderboardPanel entries={entries} loading={loading} accentClass="text-secondary" />

      <div className="flex justify-between w-full max-w-md mb-4 text-xl">
        <div className="text-primary flex items-center gap-2">
          <span>LEVEL:</span>
          <span className="font-pixel">{score.toString().padStart(2, "0")}</span>
        </div>
        <div className="text-secondary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span className="font-pixel">{highScore.toString().padStart(2, "0")}</span>
        </div>
      </div>

      <div className="relative p-1 bg-black border-4 border-secondary shadow-[0_0_20px_rgba(255,0,255,0.2)]">
        <div className="grid grid-cols-4 gap-2 bg-black p-4 w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTileClick(i)}
              className={`
                w-full h-full border-2 cursor-pointer transition-colors duration-200
                ${highlightedTile === i ? "bg-secondary border-white shadow-[0_0_15px_rgba(255,0,255,0.8)]" : "bg-secondary/10 border-secondary/30 hover:bg-secondary/20"}
              `}
            />
          ))}
        </div>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h2 className="text-3xl font-pixel text-secondary mb-4 text-glow-pink text-center">
              MEMORY
              <br />
              MATRIX
            </h2>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-secondary text-white font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> INITIATE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h2 className="text-4xl font-pixel text-red-500 mb-2 text-glow">FAILED</h2>
            <p className="text-white mb-6 font-hud text-xl">LEVEL REACHED: {score}</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-red-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white"
            >
              <RotateCcw className="w-5 h-5" /> REBOOT
            </button>
          </div>
        )}

        {showQualifyModal && qualifyScore !== null && (
          <LeaderboardQualifyModal
            open={showQualifyModal}
            gameTitle="MEMORY_MATRIX"
            score={qualifyScore}
            submitting={submitting}
            onSubmit={submitName}
            onSkip={skipQualify}
          />
        )}
      </div>

      <div className="mt-6 text-secondary font-terminal text-lg text-center h-8">
        &gt; {statusMessage || "WAITING FOR INPUT..."}
      </div>
    </div>
  );
}
