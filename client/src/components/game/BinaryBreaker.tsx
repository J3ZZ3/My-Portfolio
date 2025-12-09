import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";

export function BinaryBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);

  // Keyboard state
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let paddleX = (canvas.width - 100) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height - 30;
    let dx = 4;
    let dy = -4;
    
    // Bricks
    const brickRowCount = 5;
    const brickColumnCount = 8;
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 10;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 30;
    const paddleWidth = 100;
    const paddleSpeed = 7;

    interface Brick {
      x: number;
      y: number;
      status: number;
      color: string;
    }

    let bricks: Brick[][] = [];
    const colors = ["#00ffff", "#ff00ff", "#ffff00", "#00ff00", "#ff0000"];

    // Initialize bricks
    for (let c = 0; c < brickColumnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { 
          x: 0, 
          y: 0, 
          status: 1,
          color: colors[r % colors.length]
        };
      }
    }

    let currentScore = 0;

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleX, canvas.height - 15, paddleWidth, 15);
      ctx.fillStyle = "#00ffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00ffff";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.closePath();
    };

    const drawBricks = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          if (bricks[c][r].status === 1) {
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = bricks[c][r].color;
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
              dy = -dy;
              b.status = 0;
              currentScore += 10;
              setScore(currentScore);
              
              if (currentScore === brickRowCount * brickColumnCount * 10) {
                // Win condition (reset bricks)
                dy = -dy * 1.1; // Speed up
                // Reset bricks logic could go here
              }
            }
          }
        }
      }
    };

    const draw = () => {
      if (!isPlaying) return;

      // Update paddle position based on keyboard input
      if ((keysPressed.current["ArrowRight"] || keysPressed.current["d"]) && paddleX < canvas.width - paddleWidth) {
        paddleX += paddleSpeed;
      } else if ((keysPressed.current["ArrowLeft"] || keysPressed.current["a"]) && paddleX > 0) {
        paddleX -= paddleSpeed;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawBricks();
      drawBall();
      drawPaddle();
      collisionDetection();

      // Bounce off walls
      if (ballX + dx > canvas.width - 6 || ballX + dx < 6) {
        dx = -dx;
      }
      if (ballY + dy < 6) {
        dy = -dy;
      } else if (ballY + dy > canvas.height - 6) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          dy = -dy;
          // Add some angle variation based on where it hit the paddle
          const hitPoint = ballX - (paddleX + paddleWidth / 2);
          dx = hitPoint * 0.15;
        } else {
          // Game Over logic
          handleGameOver();
          return;
        }
      }

      ballX += dx;
      ballY += dy;

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleGameOver = () => {
      setIsPlaying(false);
      setGameOver(true);
      setHighScore(prev => Math.max(prev, currentScore));
      cancelAnimationFrame(animationFrameId);
    };

    // Mouse movement handler
    const mouseMoveHandler = (e: MouseEvent) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };
    
    // Touch movement
    const touchMoveHandler = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const relativeX = touch.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    };

    const keyDownHandler = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    if (isPlaying) {
      draw();
      document.addEventListener("mousemove", mouseMoveHandler);
      canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
      window.addEventListener("keydown", keyDownHandler);
      window.addEventListener("keyup", keyUpHandler);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("touchmove", touchMoveHandler);
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, [isPlaying, gameOver]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud">
      <div className="flex justify-between w-full max-w-[700px] mb-4 text-xl">
        <div className="text-accent flex items-center gap-2">
          <span>SCORE:</span>
          <span className="font-pixel">{score.toString().padStart(5, '0')}</span>
        </div>
        <div className="text-secondary flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span className="font-pixel">{highScore.toString().padStart(5, '0')}</span>
        </div>
      </div>

      <div className="relative border-4 border-accent p-1 bg-black shadow-[0_0_20px_rgba(0,255,255,0.2)]">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          className="w-full max-w-[700px] bg-black cursor-crosshair"
        />

        {/* Overlays */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-10">
            <h2 className="text-4xl font-pixel text-accent mb-4 text-glow">BINARY<br/>BREAKER</h2>
            <p className="text-muted-foreground mb-8 font-terminal text-xl">USE MOUSE OR A/D/ARROWS TO DEFLECT</p>
            <button 
              onClick={() => {
                setScore(0);
                setIsPlaying(true);
              }}
              className="px-8 py-3 bg-accent text-black font-bold hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Play className="w-5 h-5" /> EXECUTE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <h2 className="text-4xl font-pixel text-red-500 mb-2 text-glow">CRASHED</h2>
            <p className="text-white mb-6 font-hud text-xl">DATA MINED: {score}</p>
            <button 
              onClick={() => {
                setGameOver(false);
                setScore(0);
                setIsPlaying(true);
              }}
              className="px-8 py-3 bg-red-500 text-white font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 border-white"
            >
              <RotateCcw className="w-5 h-5" /> REBOOT
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-accent font-terminal text-sm text-center max-w-lg">
        <p>&gt; INSTRUCTIONS: BREAK FIREWALL BLOCKS TO ACCESS DATA.</p>
        <p>&gt; CONTROLS: MOUSE OR KEYBOARD (A/D/Left/Right)</p>
      </div>
    </div>
  );
}
