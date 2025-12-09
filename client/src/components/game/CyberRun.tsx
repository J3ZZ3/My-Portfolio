import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";

export function CyberRun() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Game constants
  const GRAVITY = 0.6;
  const JUMP_FORCE = -10;
  const SPEED = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let playerY = 200;
    let velocityY = 0;
    let obstacles: { x: number; width: number; height: number }[] = [];
    let frameCount = 0;
    let currentScore = 0;
    let gameSpeed = SPEED;

    const resetGame = () => {
      playerY = 200;
      velocityY = 0;
      obstacles = [];
      frameCount = 0;
      currentScore = 0;
      gameSpeed = SPEED;
      setScore(0);
      setGameOver(false);
    };

    const draw = () => {
      if (!isPlaying) return;

      // Clear canvas
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Background (Cyberpunk style)
      ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
      ctx.lineWidth = 1;
      
      // Moving floor grid
      const gridOffset = (frameCount * gameSpeed) % 40;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i - gridOffset, 300);
        ctx.lineTo(i - 200 - gridOffset, 400); // Perspective lines
        ctx.stroke();
      }
      // Horizontal floor line
      ctx.beginPath();
      ctx.moveTo(0, 300);
      ctx.lineTo(canvas.width, 300);
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.stroke();


      // Update Player
      velocityY += GRAVITY;
      playerY += velocityY;

      // Floor collision
      if (playerY > 270) { // 300 (floor) - 30 (player height)
        playerY = 270;
        velocityY = 0;
      }

      // Draw Player (Neon Box)
      ctx.fillStyle = "#00ff00";
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#00ff00";
      ctx.fillRect(50, playerY, 30, 30);
      ctx.shadowBlur = 0;

      // Generate Obstacles
      if (frameCount % 100 === 0) { // Adjust frequency
        const height = Math.random() * 40 + 20;
        obstacles.push({
          x: canvas.width,
          width: 30,
          height: height
        });
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= gameSpeed;

        // Draw Obstacle (Red Spikes/Blocks)
        ctx.fillStyle = "#ff0055";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0055";
        ctx.fillRect(obstacles[i].x, 300 - obstacles[i].height, obstacles[i].width, obstacles[i].height);
        ctx.shadowBlur = 0;

        // Collision Detection
        if (
          50 < obstacles[i].x + obstacles[i].width &&
          50 + 30 > obstacles[i].x &&
          playerY < 300 &&
          playerY + 30 > 300 - obstacles[i].height
        ) {
          handleGameOver();
          return;
        }

        // Remove off-screen obstacles
        if (obstacles[i].x + obstacles[i].width < 0) {
          obstacles.splice(i, 1);
          currentScore += 10;
          setScore(currentScore);
          
          // Speed up slightly
          if (currentScore % 50 === 0) {
             gameSpeed += 0.5;
          }
        }
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(draw);
    };

    const handleGameOver = () => {
      setIsPlaying(false);
      setGameOver(true);
      setHighScore(prev => Math.max(prev, currentScore));
      cancelAnimationFrame(animationFrameId);
    };

    const handleJump = () => {
      if (playerY >= 270) {
        velocityY = JUMP_FORCE;
      }
    };

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent scrolling
        if (isPlaying) {
          handleJump();
        } else if (!isPlaying && !gameOver) {
          setIsPlaying(true);
          resetGame(); 
        } else if (gameOver) {
           setIsPlaying(true);
           resetGame();
           draw(); // Restart loop
        }
      }
    };
    
    // Mouse/Touch for mobile
    const handleTap = (e: MouseEvent | TouchEvent) => {
       e.preventDefault();
       if (isPlaying) {
          handleJump();
        } else if (gameOver) {
           setIsPlaying(true);
           resetGame();
           draw();
        }
    };

    if (isPlaying) {
       draw();
    }

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", handleTap);
    canvas.addEventListener("touchstart", handleTap);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("mousedown", handleTap);
      canvas.removeEventListener("touchstart", handleTap);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud">
      <div className="flex justify-between w-full max-w-2xl mb-4 text-xl">
         <div className="text-primary flex items-center gap-2">
            <span>SCORE:</span>
            <span className="font-pixel">{score.toString().padStart(5, '0')}</span>
         </div>
         <div className="text-secondary flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <span className="font-pixel">{highScore.toString().padStart(5, '0')}</span>
         </div>
      </div>

      <div className="relative border-4 border-primary p-1 bg-black shadow-[0_0_20px_rgba(0,255,0,0.2)]">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full max-w-2xl bg-black cursor-pointer"
        />
        
        {/* Overlays */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <h2 className="text-4xl font-pixel text-primary mb-4 text-glow">CYBER_RUN</h2>
            <p className="text-muted-foreground mb-8 font-terminal text-xl">PRESS SPACE OR TAP TO JUMP</p>
            <button 
              onClick={() => setIsPlaying(true)}
              className="px-8 py-3 bg-primary text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> START GAME
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
             <h2 className="text-4xl font-pixel text-red-500 mb-2 text-glow">GAME OVER</h2>
             <p className="text-white mb-6 font-hud text-xl">SCORE: {score}</p>
             <button 
              onClick={() => {
                  setGameOver(false);
                  setIsPlaying(true);
              }}
              className="px-8 py-3 bg-red-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white"
            >
              <RotateCcw className="w-5 h-5" /> RETRY
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 text-muted-foreground font-terminal text-sm text-center max-w-lg">
        <p>&gt; INSTRUCTIONS: AVOID OBSTACLES TO COMPILE THE CODE.</p>
        <p>&gt; DIFFICULTY INCREASES WITH SUCCESSFUL COMPILATIONS.</p>
      </div>
    </div>
  );
}
