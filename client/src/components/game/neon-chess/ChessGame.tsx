import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { Chess, type Move, type Square } from "chess.js";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import {
  useStockfish,
  randomPlayDelayMs,
} from "@/hooks/useStockfish";
import type { StockfishMoveResult } from "@/hooks/useStockfish";
import {
  pickLine,
  evalSwingAgainstAi,
  DIALOGUE_COOLDOWN_MS,
  type DialogueTrigger,
} from "@/lib/chessBossDialogue";
import { LeaderboardPanel } from "../LeaderboardPanel";
import { ChessBossPanel } from "./ChessBossPanel";
import {
  LeaderboardQualifyModal,
  LeaderboardCongratsBanner,
} from "../LeaderboardQualifyModal";
import type { GameId } from "@/lib/leaderboard";

const PIECES: Record<string, string> = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

const INITIAL_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const END_FLASH_MS = 2000;

type EndFlash = "victory" | "defeat" | "draw";

interface ChessGameProps {
  gameId?: GameId;
}

interface PendingAiMove {
  uci: string;
  fen: string;
  evalCp: number | null;
}

function syncGameResult(
  g: Chess,
  setGameOver: (v: boolean) => void,
  setWinner: (v: "player" | "ai" | "draw" | null) => void,
) {
  if (!g.isGameOver()) {
    setGameOver(false);
    setWinner(null);
    return;
  }
  setGameOver(true);
  if (g.isCheckmate()) {
    setWinner(g.turn() === "w" ? "ai" : "player");
  } else {
    setWinner("draw");
  }
}

function fenToBoard(fen: string): { piece: string | null; square: Square }[][] {
  const rows = fen.split(" ")[0].split("/");
  const board: { piece: string | null; square: Square }[][] = [];
  for (let r = 0; r < 8; r++) {
    const row: { piece: string | null; square: Square }[] = [];
    const rankData = rows[r];
    let col = 0;
    for (const char of rankData) {
      if (/\d/.test(char)) {
        const emptySquares = parseInt(char, 10);
        for (let i = 0; i < emptySquares; i++) {
          const square = `${String.fromCharCode(97 + col)}${8 - r}` as Square;
          row.push({ piece: null, square });
          col++;
        }
      } else {
        const square = `${String.fromCharCode(97 + col)}${8 - r}` as Square;
        row.push({ piece: char, square });
        col++;
      }
    }
    board.push(row);
  }
  return board;
}

function parseUciToMove(uci: string) {
  return {
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    promotion: uci.length > 4 ? (uci[4] as "q" | "r" | "b" | "n") : ("q" as const),
  };
}

export function ChessGame({ gameId = "chess" }: ChessGameProps) {
  const [fen, setFen] = useState(INITIAL_FEN);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | "draw" | null>(null);
  const [thinking, setThinking] = useState(false);
  const [bossLine, setBossLine] = useState("");
  const [endFlash, setEndFlash] = useState<EndFlash | null>(null);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const winStreak = useRef(0);
  const lastEvalRef = useRef<number | null>(null);
  const evalBeforePlayerMoveRef = useRef<number | null>(null);
  const recentLinesRef = useRef<string[]>([]);
  const lastDialogueAtRef = useRef(0);
  const pendingMoveRef = useRef<PendingAiMove | null>(null);
  const aiSearchFenRef = useRef<string | null>(null);
  const aiTurnStartedAtRef = useRef(0);
  const playDelayMsRef = useRef(0);
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameStartedRef = useRef(false);

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

  const sayBossLine = useCallback((trigger: DialogueTrigger, force = false) => {
    const now = Date.now();
    if (!force && now - lastDialogueAtRef.current < DIALOGUE_COOLDOWN_MS) return;
    const line = pickLine(trigger, recentLinesRef.current);
    recentLinesRef.current = [line, ...recentLinesRef.current].slice(0, 3);
    lastDialogueAtRef.current = now;
    setBossLine(line);
  }, []);

  const applyAiMove = useCallback(
    (pending: PendingAiMove, lastPlayerMove?: Move | null) => {
      try {
        const ai = new Chess(pending.fen);
        const { from, to, promotion } = parseUciToMove(pending.uci);
        const move = ai.move({ from, to, promotion });
        if (!move) {
          setThinking(false);
          return;
        }

        const newFen = ai.fen();
        setFen(newFen);
        setLastMove({ from, to });
        syncGameResult(ai, setGameOver, setWinner);

        if (move.captured) sayBossLine("aiCapture");
        else if (ai.inCheck()) sayBossLine("aiCheck");
        else if (pending.evalCp !== null && pending.evalCp >= 300) sayBossLine("aiWinning");

        if (pending.evalCp !== null) {
          lastEvalRef.current = pending.evalCp;
        }
      } catch {
        // ignore invalid engine move
      } finally {
        setThinking(false);
        pendingMoveRef.current = null;
        aiSearchFenRef.current = null;
      }
    },
    [sayBossLine],
  );

  const tryApplyPendingMove = useCallback(() => {
    const pending = pendingMoveRef.current;
    if (!pending) return;

    const elapsed = Date.now() - aiTurnStartedAtRef.current;
    if (elapsed < playDelayMsRef.current) return;

    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    applyAiMove(pending);
  }, [applyAiMove]);

  const onBestMove = useCallback(
    (result: StockfishMoveResult) => {
      const fenBeforeAi = aiSearchFenRef.current;
      if (!fenBeforeAi) return;

      const swing = evalSwingAgainstAi(
        evalBeforePlayerMoveRef.current,
        result.evalCp,
      );
      if (swing >= 150) sayBossLine("aiOutplayed");
      else if (result.evalCp !== null && result.evalCp <= -500) sayBossLine("aiPanicking");

      pendingMoveRef.current = {
        uci: result.uci,
        fen: fenBeforeAi,
        evalCp: result.evalCp,
      };

      tryApplyPendingMove();

      if (pendingMoveRef.current) {
        const remaining =
          playDelayMsRef.current - (Date.now() - aiTurnStartedAtRef.current);
        delayTimerRef.current = setTimeout(
          tryApplyPendingMove,
          Math.max(0, remaining),
        );
      }
    },
    [tryApplyPendingMove, sayBossLine],
  );

  const onEval = useCallback((evalCp: number) => {
    lastEvalRef.current = evalCp;
  }, []);

  const { engineReady, requestMove, stop, newGame } = useStockfish({
    onBestMove,
    onEval,
  });

  const startAiTurn = useCallback(
    (currentFen: string) => {
      const preview = new Chess(currentFen);
      if (preview.isGameOver() || preview.turn() !== "b") return;

      setThinking(true);
      aiTurnStartedAtRef.current = Date.now();
      playDelayMsRef.current = randomPlayDelayMs();
      aiSearchFenRef.current = currentFen;
      pendingMoveRef.current = null;
      sayBossLine("aiThinking", true);

      requestMove(currentFen);
    },
    [requestMove, sayBossLine],
  );

  useEffect(() => {
    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (endFlashTimerRef.current) clearTimeout(endFlashTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!gameOver || !winner) {
      setEndFlash(null);
      setShowEndOverlay(false);
      return;
    }

    const flash: EndFlash =
      winner === "player" ? "victory" : winner === "ai" ? "defeat" : "draw";
    setEndFlash(flash);
    setShowEndOverlay(false);

    if (endFlashTimerRef.current) clearTimeout(endFlashTimerRef.current);
    endFlashTimerRef.current = setTimeout(() => {
      setShowEndOverlay(true);
    }, END_FLASH_MS);

    return () => {
      if (endFlashTimerRef.current) clearTimeout(endFlashTimerRef.current);
    };
  }, [gameOver, winner]);

  useEffect(() => {
    if (engineReady && !gameStartedRef.current) {
      gameStartedRef.current = true;
      sayBossLine("gameStart", true);
    }
  }, [engineReady, sayBossLine]);

  useEffect(() => {
    if (gameOver && winner === "player") {
      winStreak.current += 1;
      checkQualifyRef.current(winStreak.current);
      sayBossLine("playerWin", true);
    } else if (gameOver && winner === "ai") {
      winStreak.current = 0;
      sayBossLine("aiWin", true);
    } else if (gameOver && winner === "draw") {
      sayBossLine("draw", true);
    }
  }, [gameOver, winner, sayBossLine]);

  const handleSquareClick = (square: Square) => {
    if (thinking || gameOver || !engineReady) return;

    const g = new Chess(fen);
    if (g.turn() !== "w") return;

    const piece = g.get(square);
    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (piece && piece.color === "w") {
        setSelectedSquare(square);
        setLegalMoves(g.moves({ square, verbose: true }));
        return;
      }

      try {
        evalBeforePlayerMoveRef.current = lastEvalRef.current;
        const move = g.move({ from: selectedSquare, to: square, promotion: "q" });
        const newFen = g.fen();
        setFen(newFen);
        setLastMove({ from: selectedSquare, to: square });
        syncGameResult(g, setGameOver, setWinner);
        setSelectedSquare(null);
        setLegalMoves([]);

        if (move.captured) sayBossLine("playerCapture");
        else if (g.inCheck()) sayBossLine("playerCheck");
        else sayBossLine("playerMove");

        if (!g.isGameOver()) {
          startAiTurn(newFen);
        }
      } catch {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else if (piece && piece.color === "w") {
      setSelectedSquare(square);
      setLegalMoves(g.moves({ square, verbose: true }));
    }
  };

  const dismissEndOverlay = () => setShowEndOverlay(false);

  const handlePlayAgain = () => {
    if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    if (endFlashTimerRef.current) clearTimeout(endFlashTimerRef.current);
    pendingMoveRef.current = null;
    aiSearchFenRef.current = null;
    newGame();
    setFen(INITIAL_FEN);
    setSelectedSquare(null);
    setLegalMoves([]);
    setGameOver(false);
    setWinner(null);
    setEndFlash(null);
    setShowEndOverlay(false);
    setLastMove(null);
    setThinking(false);
    lastEvalRef.current = null;
    evalBeforePlayerMoveRef.current = null;
    sayBossLine("gameStart", true);
  };

  const game = new Chess(fen);
  const board = fenToBoard(fen);
  const isLightSquare = (row: number, col: number) => (row + col) % 2 === 0;
  const boardLocked = thinking || !engineReady || gameOver;

  const boardBorderClass =
    endFlash === "victory"
      ? "animate-pulse border-4 border-primary shadow-[0_0_30px_#00ff41]"
      : endFlash === "defeat"
        ? "animate-pulse border-4 border-red-500 shadow-[0_0_30px_#ef4444]"
        : endFlash === "draw"
          ? "animate-pulse border-4 border-yellow-400 shadow-[0_0_30px_#eab308]"
          : "border-4 border-primary shadow-[0_0_20px_#00ff41]";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center font-hud overflow-y-auto p-2">
      <LeaderboardCongratsBanner message={congratsMessage} onDismiss={dismissCongrats} />
      <LeaderboardPanel entries={entries} loading={loading} accentClass="text-yellow-400" />

      <div className="relative w-full max-w-4xl mx-auto p-4">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
          <div className="flex flex-col items-center">
            <div
              className={`grid grid-cols-8 ${boardBorderClass} ${
                boardLocked ? "opacity-90 pointer-events-none" : ""
              }`}
            >
              {board.map((row, rowIdx) =>
                row.map((cell, colIdx) => {
                  const isSelected = selectedSquare === cell.square;
                  const isLegalTarget = legalMoves.some((m) => m.to === cell.square);
                  const isMoveTo =
                    !isSelected && !isLegalTarget && lastMove?.to === cell.square;
                  const isMoveFrom =
                    !isSelected && !isLegalTarget && !isMoveTo && lastMove?.from === cell.square;
                  const bg = isLightSquare(rowIdx, colIdx)
                    ? "bg-gray-800/80"
                    : "bg-black/90";
                  const squareStyle = isSelected
                    ? "ring-4 ring-yellow-400 ring-inset"
                    : isLegalTarget
                      ? "ring-4 ring-green-400/50 ring-inset"
                      : isMoveTo
                        ? "ring-2 ring-cyan-300 ring-inset bg-cyan-400/30"
                        : isMoveFrom
                          ? "ring-2 ring-cyan-400/70 ring-inset bg-cyan-500/20"
                          : "";
                  return (
                    <div
                      key={cell.square}
                      onClick={() => handleSquareClick(cell.square)}
                      className={`${bg} ${squareStyle} w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all hover:bg-opacity-70`}
                    >
                      {cell.piece && (
                        <span
                          className={`font-pixel text-2xl sm:text-3xl ${
                            cell.piece === cell.piece.toUpperCase()
                              ? "text-primary drop-shadow-[0_0_6px_#00ff41]"
                              : "text-pink-500 drop-shadow-[0_0_6px_#ff1493]"
                          }`}
                        >
                          {PIECES[cell.piece] ?? ""}
                        </span>
                      )}
                      {isLegalTarget && !cell.piece && (
                        <div className="w-3 h-3 rounded-full bg-green-400/60" />
                      )}
                    </div>
                  );
                }),
              )}
            </div>

            <div className="mt-4 font-terminal text-sm text-primary flex flex-wrap gap-4 justify-center">
              <span>
                {!engineReady
                  ? "ENGINE LOADING..."
                  : endFlash === "victory"
                    ? "NULLSPAWN ELIMINATED"
                    : endFlash === "defeat"
                      ? "SYSTEM BREACHED"
                      : endFlash === "draw"
                        ? "STALEMATE"
                        : thinking
                          ? "NULLSPAWN THINKING..."
                          : game.turn() === "w"
                            ? "YOUR TURN"
                            : "NULLSPAWN TURN"}
              </span>
              {game.inCheck() && (
                <span className="text-yellow-400 animate-pulse">CHECK!</span>
              )}
              {winStreak.current > 0 && !gameOver && (
                <span className="text-yellow-400">STREAK: {winStreak.current}</span>
              )}
            </div>
          </div>

          <ChessBossPanel
            line={bossLine}
            thinking={thinking}
            showRematch={gameOver}
            onRematch={handlePlayAgain}
          />
        </div>

        {showEndOverlay && (
          <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
            <div
              className={`relative bg-black/90 border-2 p-6 text-center font-pixel ${
                winner === "player"
                  ? "border-primary"
                  : winner === "ai"
                    ? "border-red-500"
                    : "border-yellow-400"
              }`}
            >
              <button
                type="button"
                onClick={dismissEndOverlay}
                aria-label="Close"
                className="absolute top-2 right-2 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2
                className={`text-2xl mb-2 ${
                  winner === "player"
                    ? "text-primary"
                    : winner === "ai"
                      ? "text-red-500"
                      : "text-yellow-400"
                }`}
              >
                {winner === "player"
                  ? "VICTORY"
                  : winner === "ai"
                    ? "DEFEAT"
                    : "DRAW"}
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                {winner === "player"
                  ? "You purged NULLSPAWN from the mainframe."
                  : winner === "ai"
                    ? "NULLSPAWN has consumed your king. Your fate is sealed."
                    : "Stalemate. You and NULLSPAWN are locked in eternal conflict."}
              </p>
              <button
                onClick={handlePlayAgain}
                className="bg-primary text-black px-4 py-2 border-2 border-black hover:bg-green-400 transition font-pixel"
              >
                PLAY_AGAIN
              </button>
            </div>
          </div>
        )}

        {showQualifyModal && qualifyScore !== null && (
          <LeaderboardQualifyModal
            open={showQualifyModal}
            gameTitle="NEON_CHESS"
            score={qualifyScore}
            submitting={submitting}
            onSubmit={submitName}
            onSkip={skipQualify}
          />
        )}
      </div>

      <div className="mt-6 text-muted-foreground font-terminal text-sm text-center max-w-lg">
        <p>&gt; INSTRUCTIONS: CHECKMATE NULLSPAWN TO WIN. WIN STREAKS RANK ON THE LEADERBOARD.</p>
      </div>
    </div>
  );
}
