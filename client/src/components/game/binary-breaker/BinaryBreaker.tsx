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
  clampPaddle,
  createQualifyGuard,
  hitBrick,
  pointerToCanvasX,
  readStoredBest,
  resetQualification,
  writeStoredBest,
} from "../arcadeLogic";

interface BinaryBreakerProps {
  gameId?: GameId;
}

const BEST_KEY = "koji-best-breaker";
const BRICK_ROWS = 5;
const BRICK_COLUMNS = 8;
const TOTAL_BRICKS = BRICK_ROWS * BRICK_COLUMNS;

function loadBest(): number {
  if (typeof localStorage === "undefined") return 0;
  return readStoredBest(() => localStorage.getItem(BEST_KEY));
}

export function BinaryBreaker({ gameId = "breaker" }: BinaryBreakerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [bricksLeft, setBricksLeft] = useState(TOTAL_BRICKS);
  const [highScore, setHighScore] = useState(loadBest);
  const [gameOver, setGameOver] = useState(false);
  const [cleared, setCleared] = useState(false);
  const qualifyGuard = useRef(createQualifyGuard());
  const keysPressed = useRef<Record<string, boolean>>({});

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
    setBricksLeft(TOTAL_BRICKS);
    setGameOver(false);
    setCleared(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animationFrameId = 0;
    let paddleX = (canvas.width - 100) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let dx = 4;
    let dy = -4;
    let currentScore = 0;
    let bricksRemaining = TOTAL_BRICKS;
    const paddleWidth = 100;
    const paddleSpeed = 7;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000"];
    const flashes: { x: number; y: number; color: string; life: number }[] = [];
    const bricks = Array.from({ length: BRICK_COLUMNS }, (_, column) =>
      Array.from({ length: BRICK_ROWS }, (_, row) => ({
        x: column * (brickWidth + brickPadding) + brickOffsetLeft,
        y: row * (brickHeight + brickPadding) + brickOffsetTop,
        status: 1,
        color: colors[row % colors.length],
      })),
    );

    const finish = (result: number, victory: boolean) => {
      setScore(result);
      setFinalScore(result);
      setBricksLeft(bricksRemaining);
      setHighScore((previous) => {
        const next = Math.max(previous, result);
        if (next !== previous) {
          writeStoredBest((value) => localStorage.setItem(BEST_KEY, value), next);
        }
        return next;
      });
      setCleared(victory);
      setGameOver(!victory);
      setIsPlaying(false);
      if (claimQualification(qualifyGuard.current)) {
        void checkQualifyRef.current(result);
      }
    };

    const draw = () => {
      if (keysPressed.current["ArrowRight"] || keysPressed.current["d"]) {
        paddleX = clampPaddle(paddleX + paddleSpeed, canvas.width, paddleWidth);
      } else if (keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) {
        paddleX = clampPaddle(paddleX - paddleSpeed, canvas.width, paddleWidth);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const column of bricks) {
        for (const brick of column) {
          if (brick.status !== 1) continue;
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const flash = flashes[i];
        ctx.fillStyle = flash.color;
        ctx.globalAlpha = flash.life / 8;
        ctx.fillRect(flash.x, flash.y, brickWidth, brickHeight);
        ctx.globalAlpha = 1;
        flash.life -= 1;
        if (flash.life <= 0) flashes.splice(i, 1);
      }

      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "#00ffff";
      ctx.shadowBlur = 16;
      ctx.shadowColor = "#00ffff";
      ctx.fillRect(paddleX, canvas.height - 15, paddleWidth, 15);
      ctx.shadowBlur = 0;

      let clearedThisFrame = false;
      for (const column of bricks) {
        for (const brick of column) {
          if (brick.status !== 1) continue;
          const hitsBrick =
            ballX > brick.x &&
            ballX < brick.x + brickWidth &&
            ballY > brick.y &&
            ballY < brick.y + brickHeight;
          if (!hitsBrick) continue;
          dy = -dy;
          brick.status = 0;
          const hit = hitBrick(currentScore, bricksRemaining);
          currentScore = hit.score;
          bricksRemaining = hit.bricksLeft;
          setScore(currentScore);
          setBricksLeft(bricksRemaining);
          if (!reducedMotion) {
            flashes.push({ x: brick.x, y: brick.y, color: brick.color, life: 8 });
          }
          if (hit.cleared) clearedThisFrame = true;
        }
      }

      if (clearedThisFrame) {
        finish(currentScore, true);
        return;
      }

      if (ballX + dx > canvas.width - 6 || ballX + dx < 6) dx = -dx;
      if (ballY + dy < 6) {
        dy = -dy;
      } else if (ballY + dy > canvas.height - 6) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          dy = -dy;
          dx = (ballX - (paddleX + paddleWidth / 2)) * 0.15;
        } else {
          finish(currentScore, false);
          return;
        }
      }

      ballX += dx;
      ballY += dy;
      animationFrameId = requestAnimationFrame(draw);
    };

    const movePaddle = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = pointerToCanvasX(clientX, rect, canvas.width);
      paddleX = clampPaddle(x - paddleWidth / 2, canvas.width, paddleWidth);
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      movePaddle(event.clientX);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" || canvas.hasPointerCapture(event.pointerId)) {
        movePaddle(event.clientX);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = false;
    };

    animationFrameId = requestAnimationFrame(draw);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keysPressed.current = {};
    };
  }, [isPlaying]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud overflow-y-auto p-2">
      <LeaderboardCongratsBanner message={congratsMessage} onDismiss={dismissCongrats} />
      <LeaderboardPanel entries={entries} loading={loading} offline={offline} accentClass="text-accent" />

      <div className="flex justify-between w-full max-w-[700px] mb-4 text-xl gap-3">
        <div className="text-accent flex items-center gap-2">
          <span>SCORE:</span>
          <span className="font-pixel">{score.toString().padStart(5, "0")}</span>
        </div>
        <div className="text-primary flex items-center gap-2">
          <span>BRICKS:</span>
          <span className="font-pixel">{bricksLeft.toString().padStart(2, "0")}</span>
        </div>
        <div className="text-secondary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span className="font-pixel text-[10px]">LOCAL_BEST</span>
          <span className="font-pixel">{highScore.toString().padStart(5, "0")}</span>
        </div>
      </div>

      <div className="relative w-full max-w-[700px] border-4 border-accent p-1 bg-black shadow-[0_0_20px_rgba(0,255,255,0.2)]">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          className="block w-full h-auto aspect-[7/5] bg-black cursor-crosshair touch-none"
        />

        {!isPlaying && !gameOver && !cleared && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10 text-center px-4 overflow-y-auto">
            <h2 className="text-4xl font-pixel text-accent mb-4 text-glow">
              BINARY
              <br />
              BREAKER
            </h2>
            <p className="text-muted-foreground mb-8 font-terminal text-xl">MOUSE, TOUCH, OR A/D</p>
            <button
              onClick={beginRun}
              className="px-8 py-3 bg-accent text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> EXECUTE
            </button>
          </div>
        )}

        {(gameOver || cleared) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 text-center px-4 overflow-y-auto">
            <h2 className={`text-4xl font-pixel mb-2 text-glow ${cleared ? "text-accent" : "text-red-500"}`}>
              {cleared ? "SECTOR_CLEARED" : "GAME_OVER"}
            </h2>
            <p className="text-white mb-2 font-hud text-xl">FINAL_SCORE: {finalScore}</p>
            <p className="text-secondary mb-6 font-terminal">
              {cleared ? "ROUND COMPLETE" : "DATA MINED"} · LOCAL_BEST: {highScore}
            </p>
            <button
              onClick={beginRun}
              className="px-8 py-3 bg-red-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white"
            >
              <RotateCcw className="w-5 h-5" /> {cleared ? "REPLAY" : "REBOOT"}
            </button>
          </div>
        )}

        {showQualifyModal && qualifyScore !== null && (
          <LeaderboardQualifyModal
            open={showQualifyModal}
            gameTitle="BINARY_BREAKER"
            score={qualifyScore}
            submitting={submitting}
            onSubmit={submitName}
            onSkip={skipQualify}
          />
        )}
      </div>

      <div className="mt-6 text-accent font-terminal text-sm text-center max-w-lg">
        <p>&gt; MOUSE, TOUCH, OR A/D/ARROWS. CLEAR EVERY BRICK.</p>
      </div>
    </div>
  );
}
