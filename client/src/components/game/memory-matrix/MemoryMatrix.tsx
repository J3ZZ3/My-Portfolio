import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPanel } from "../LeaderboardPanel";
import {
  LeaderboardQualifyModal,
  LeaderboardCongratsBanner,
} from "../LeaderboardQualifyModal";
import type { GameId } from "@/lib/leaderboard";
import { audio } from "@/lib/audio";
import {
  claimQualification,
  createQualifyGuard,
  isPlaybackCurrent,
  nextPlaybackSession,
  readStoredBest,
  resetQualification,
  writeStoredBest,
} from "../arcadeLogic";

const GRID_SIZE = 4;
const INITIAL_SEQUENCE_LENGTH = 3;
const BEST_KEY = "koji-best-memory";

interface MemoryMatrixProps {
  gameId?: GameId;
}

type Feedback = { index: number | "all"; kind: "ok" | "bad" | "clear" } | null;

function loadBest(): number {
  if (typeof localStorage === "undefined") return 0;
  return readStoredBest(() => localStorage.getItem(BEST_KEY));
}

export function MemoryMatrix({ gameId = "memory" }: MemoryMatrixProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(loadBest);
  const [gameOver, setGameOver] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const sessionRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const sequenceRef = useRef<number[]>([]);
  const scoreRef = useRef(0);
  const qualifyGuard = useRef(createQualifyGuard());

  const {
    entries,
    loading,
    qualifyScore,
    showQualifyModal,
    congratsMessage,
    submitting,
    offline,
    checkQualify,
    submitName,
    skipQualify,
    dismissCongrats,
  } = useLeaderboard(gameId);

  const checkQualifyRef = useRef(checkQualify);
  checkQualifyRef.current = checkQualify;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const cancelPlayback = () => {
    sessionRef.current = nextPlaybackSession(sessionRef.current);
    clearTimers();
    setHighlightedTile(null);
    setFeedback(null);
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    return () => {
      sessionRef.current = nextPlaybackSession(sessionRef.current);
      timersRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const wait = (ms: number, session: number) =>
    new Promise<boolean>((resolve) => {
      const id = window.setTimeout(() => {
        resolve(isPlaybackCurrent(sessionRef.current, session));
      }, ms);
      timersRef.current.push(id);
    });

  const playSequence = async (seq: number[], session: number) => {
    setIsPlayerTurn(false);
    setStatusMessage("WATCH PATTERN");
    for (const tile of seq) {
      if (!(await wait(500, session))) return;
      if (!isPlaybackCurrent(sessionRef.current, session)) return;
      setHighlightedTile(tile);
      audio.playTone(420 + tile * 40, "square", 0.08);
      if (!(await wait(500, session))) {
        setHighlightedTile(null);
        return;
      }
      setHighlightedTile(null);
    }
    if (!isPlaybackCurrent(sessionRef.current, session)) return;
    setIsPlayerTurn(true);
    setStatusMessage("REPEAT PATTERN");
  };

  const startGame = () => {
    cancelPlayback();
    resetQualification(qualifyGuard.current);
    const session = sessionRef.current;
    const next = Array.from({ length: INITIAL_SEQUENCE_LENGTH }, () =>
      Math.floor(Math.random() * GRID_SIZE * GRID_SIZE),
    );
    sequenceRef.current = next;
    scoreRef.current = 0;
    setSequence(next);
    setPlayerSequence([]);
    setScore(0);
    setFinalScore(0);
    setGameOver(false);
    setIsPlaying(true);
    void playSequence(next, session);
  };

  const rememberBest = (result: number) => {
    setHighScore((previous) => {
      const next = Math.max(previous, result);
      if (next !== previous) {
        writeStoredBest((value) => localStorage.setItem(BEST_KEY, value), next);
      }
      return next;
    });
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || !isPlayerTurn || gameOver) return;
    const session = sessionRef.current;
    const progress = [...playerSequence, index];
    setPlayerSequence(progress);
    setHighlightedTile(index);

    if (sequenceRef.current[progress.length - 1] !== index) {
      setFeedback({ index, kind: "bad" });
      setIsPlayerTurn(false);
      setGameOver(true);
      setIsPlaying(false);
      setFinalScore(scoreRef.current);
      rememberBest(scoreRef.current);
      setStatusMessage("SYSTEM FAILURE");
      audio.playTone(140, "sawtooth", 0.12);
      if (claimQualification(qualifyGuard.current)) {
        void checkQualifyRef.current(scoreRef.current);
      }
      const id = window.setTimeout(() => {
        if (isPlaybackCurrent(sessionRef.current, session)) setHighlightedTile(null);
      }, 180);
      timersRef.current.push(id);
      return;
    }

    setFeedback({ index, kind: "ok" });
    audio.playTone(720, "sine", 0.06);
    const clearHighlight = window.setTimeout(() => {
      if (isPlaybackCurrent(sessionRef.current, session)) setHighlightedTile(null);
    }, 160);
    timersRef.current.push(clearHighlight);

    if (progress.length !== sequenceRef.current.length) return;

    const nextScore = scoreRef.current + 1;
    scoreRef.current = nextScore;
    setScore(nextScore);
    setPlayerSequence([]);
    setIsPlayerTurn(false);
    setFeedback({ index: "all", kind: "clear" });
    setStatusMessage("SEQUENCE COMPLETE");
    audio.playTone(880, "square", 0.08);

    const advance = window.setTimeout(() => {
      if (!isPlaybackCurrent(sessionRef.current, session)) return;
      const nextSequence = [
        ...sequenceRef.current,
        Math.floor(Math.random() * GRID_SIZE * GRID_SIZE),
      ];
      sequenceRef.current = nextSequence;
      setSequence(nextSequence);
      setFeedback(null);
      void playSequence(nextSequence, session);
    }, 700);
    timersRef.current.push(advance);
  };

  const tileClass = (index: number) => {
    if (feedback?.kind === "clear") return "bg-cyan-400/40 border-cyan-200";
    if (feedback?.index === index && feedback.kind === "ok") return "bg-cyan-400/30 border-cyan-300";
    if (feedback?.index === index && feedback.kind === "bad") return "bg-red-500/50 border-red-300";
    if (highlightedTile === index) return "bg-secondary border-white shadow-[0_0_15px_rgba(255,0,255,0.8)]";
    return "bg-secondary/10 border-secondary/30 hover:bg-secondary/20";
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud overflow-y-auto p-2">
      <LeaderboardCongratsBanner message={congratsMessage} onDismiss={dismissCongrats} />
      <LeaderboardPanel entries={entries} loading={loading} offline={offline} accentClass="text-secondary" />

      <div className="flex justify-between w-full max-w-md mb-4 text-xl gap-3">
        <div className="text-primary flex items-center gap-2">
          <span>LEVEL:</span>
          <span className="font-pixel">{score.toString().padStart(2, "0")}</span>
        </div>
        <div className="text-accent flex items-center gap-2">
          <span>PATTERN:</span>
          <span className="font-pixel">{sequence.length.toString().padStart(2, "0")}</span>
        </div>
        <div className="text-secondary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span className="font-pixel text-[10px]">LOCAL_BEST</span>
          <span className="font-pixel">{highScore.toString().padStart(2, "0")}</span>
        </div>
      </div>

      <div className="relative p-1 bg-black border-4 border-secondary shadow-[0_0_20px_rgba(255,0,255,0.2)] max-w-full">
        <div className="grid grid-cols-4 gap-2 bg-black p-4 w-[min(100%,300px)] aspect-square md:w-[min(100%,400px)]">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Tile ${index + 1}`}
              onClick={() => handleTileClick(index)}
              className={`w-full h-full border-2 motion-safe:transition-colors motion-safe:duration-150 ${tileClass(index)}`}
            />
          ))}
        </div>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 overflow-y-auto">
            <h2 className="text-3xl font-pixel text-secondary mb-4 text-glow-pink text-center">
              MEMORY
              <br />
              MATRIX
            </h2>
            <p className="text-muted-foreground mb-6 font-terminal text-center">TAP THE TILES</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-secondary text-white font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> INITIATE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 overflow-y-auto text-center px-4">
            <h2 className="text-4xl font-pixel text-red-500 mb-2 text-glow">GAME_OVER</h2>
            <p className="text-white mb-2 font-hud text-xl">FINAL_SCORE: {finalScore}</p>
            <p className="text-secondary mb-6 font-terminal">LOCAL_BEST: {highScore}</p>
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

      <div className="mt-6 text-secondary font-terminal text-lg text-center h-8 flex items-center justify-center gap-4">
        <span>&gt; {statusMessage || "WAITING FOR INPUT..."}</span>
        {isPlaying && !gameOver && (
          <button
            type="button"
            onClick={startGame}
            className="px-3 py-1 border border-secondary text-xs font-pixel text-secondary hover:bg-secondary hover:text-white"
          >
            REBOOT
          </button>
        )}
      </div>
    </div>
  );
}
