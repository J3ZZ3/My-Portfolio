import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { LeaderboardPanel } from "../LeaderboardPanel";
import {
  LeaderboardQualifyModal,
  LeaderboardCongratsBanner,
} from "../LeaderboardQualifyModal";
import type { GameId } from "@/lib/leaderboard";
import {
  claimQualification,
  createCyberRunSession,
  createQualifyGuard,
  readStoredBest,
  resetQualification,
  writeStoredBest,
} from "../arcadeLogic";

interface CyberRunProps {
  gameId?: GameId;
}

const BEST_KEY = "koji-best-run";
const GRAVITY = 0.6;
const JUMP_FORCE = -10;

function loadBest(): number {
  if (typeof localStorage === "undefined") return 0;
  return readStoredBest(() => localStorage.getItem(BEST_KEY));
}

export function CyberRun({ gameId = "run" }: CyberRunProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [highScore, setHighScore] = useState(loadBest);
  const [gameOver, setGameOver] = useState(false);
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

  const beginRun = () => {
    resetQualification(qualifyGuard.current);
    setScore(0);
    setFinalScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };

  const beginRunRef = useRef(beginRun);
  beginRunRef.current = beginRun;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" || isPlaying) return;
      event.preventDefault();
      beginRunRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const session = createCyberRunSession();
    const flashes: { x: number; y: number; life: number }[] = [];
    let animationFrameId = 0;

    const finish = (result: number) => {
      setScore(result);
      setFinalScore(result);
      setHighScore((previous) => {
        const next = Math.max(previous, result);
        if (next !== previous) {
          writeStoredBest((value) => localStorage.setItem(BEST_KEY, value), next);
        }
        return next;
      });
      setGameOver(true);
      setIsPlaying(false);
      if (claimQualification(qualifyGuard.current)) {
        void checkQualifyRef.current(result);
      }
    };

    const draw = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
      ctx.lineWidth = 1;
      const gridOffset = (session.frameCount * session.gameSpeed) % 40;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i - gridOffset, 300);
        ctx.lineTo(i - 200 - gridOffset, 400);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.lineTo(canvas.width, 300);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.stroke();

      session.velocityY += GRAVITY;
      session.playerY += session.velocityY;
      if (session.playerY > 270) {
        session.playerY = 270;
        session.velocityY = 0;
      }

      const jumping = session.velocityY < 0;
      ctx.fillStyle = "#00ff00";
      ctx.shadowBlur = jumping && !reducedMotion ? 28 : 15;
      ctx.shadowColor = "#00ff00";
      ctx.fillRect(50, session.playerY, 30, 30);
      ctx.shadowBlur = 0;

      if (session.frameCount % 100 === 0) {
        session.obstacles.push({
          x: canvas.width,
          width: 30,
          height: Math.random() * 40 + 20,
        });
      }

      for (let i = session.obstacles.length - 1; i >= 0; i--) {
        const obstacle = session.obstacles[i];
        obstacle.x -= session.gameSpeed;
        ctx.fillStyle = "#ff0055";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0055";
        ctx.fillRect(obstacle.x, 300 - obstacle.height, obstacle.width, obstacle.height);
        ctx.shadowBlur = 0;

        if (
          50 < obstacle.x + obstacle.width &&
          80 > obstacle.x &&
          session.playerY < 300 &&
          session.playerY + 30 > 300 - obstacle.height
        ) {
          finish(session.score);
          return;
        }

        if (obstacle.x + obstacle.width < 0) {
          session.obstacles.splice(i, 1);
          session.score += 10;
          setScore(session.score);
          if (!reducedMotion) flashes.push({ x: 80, y: 260, life: 10 });
          if (session.score % 50 === 0) session.gameSpeed += 0.5;
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const flash = flashes[i];
        ctx.fillStyle = `rgba(0, 255, 0, ${flash.life / 10})`;
        ctx.fillRect(flash.x, flash.y, 8, 8);
        flash.life -= 1;
        if (flash.life <= 0) flashes.splice(i, 1);
      }

      session.frameCount += 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    const jump = () => {
      if (session.playerY >= 270) session.velocityY = JUMP_FORCE;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      jump();
    };

    const onTap = (event: Event) => {
      event.preventDefault();
      jump();
    };

    animationFrameId = requestAnimationFrame(draw);
    window.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("mousedown", onTap);
    canvas.addEventListener("touchstart", onTap, { passive: false });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("mousedown", onTap);
      canvas.removeEventListener("touchstart", onTap);
    };
  }, [isPlaying]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud overflow-y-auto p-2">
      <LeaderboardCongratsBanner message={congratsMessage} onDismiss={dismissCongrats} />
      <LeaderboardPanel entries={entries} loading={loading} offline={offline} accentClass="text-primary" />

      <div className="flex justify-between w-full max-w-2xl mb-4 text-xl">
        <div className="text-primary flex items-center gap-2">
          <span>SCORE:</span>
          <span className="font-pixel">{score.toString().padStart(5, "0")}</span>
        </div>
        <div className="text-secondary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span className="font-pixel text-xs">LOCAL_BEST</span>
          <span className="font-pixel">{highScore.toString().padStart(5, "0")}</span>
        </div>
      </div>

      <div className="relative w-full max-w-2xl border-4 border-primary p-1 bg-black shadow-[0_0_20px_rgba(0,255,0,0.2)]">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="block w-full h-auto aspect-[2/1] bg-black cursor-pointer touch-none"
        />

        {!isPlaying && !gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={beginRun}
          >
            <h2 className="text-4xl font-pixel text-primary mb-4 text-glow text-center">CYBER_RUN</h2>
            <p className="text-muted-foreground mb-8 font-terminal text-xl text-center">SPACE OR TAP</p>
            <button
              onClick={beginRun}
              className="px-8 py-3 bg-primary text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center px-4 overflow-y-auto"
            onClick={beginRun}
          >
            <h2 className="text-4xl font-pixel text-red-500 mb-2 text-glow">GAME_OVER</h2>
            <p className="text-white mb-2 font-hud text-xl">FINAL_SCORE: {finalScore}</p>
            <p className="text-secondary mb-6 font-terminal">LOCAL_BEST: {highScore}</p>
            <button
              onClick={beginRun}
              className="px-8 py-3 bg-red-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white"
            >
              <RotateCcw className="w-5 h-5" /> RETRY
            </button>
          </div>
        )}

        {showQualifyModal && qualifyScore !== null && (
          <LeaderboardQualifyModal
            open={showQualifyModal}
            gameTitle="CYBER_RUN"
            score={qualifyScore}
            submitting={submitting}
            onSubmit={submitName}
            onSkip={skipQualify}
          />
        )}
      </div>

      <div className="mt-6 text-muted-foreground font-terminal text-sm text-center max-w-lg">
        <p>&gt; SPACE OR TAP TO JUMP. AVOID THE OBSTACLES.</p>
      </div>
    </div>
  );
}
