import { useCallback, useEffect, useRef, useState } from "react";
import {
  STOCKFISH_DEPTH,
  STOCKFISH_ENGINE_URL,
  parseBestMove,
  parseUciEval,
  sideToMoveFromFen,
} from "@/lib/stockfishUci";

export interface StockfishMoveResult {
  uci: string;
  evalCp: number | null;
}

export interface UseStockfishOptions {
  depth?: number;
  onBestMove?: (result: StockfishMoveResult) => void;
  onEval?: (evalCp: number) => void;
  onEngineLine?: (line: string) => void;
}

export function useStockfish({
  depth = STOCKFISH_DEPTH,
  onBestMove,
  onEval,
  onEngineLine,
}: UseStockfishOptions = {}) {
  const [engineReady, setEngineReady] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  const lastEvalRef = useRef<number | null>(null);
  const searchFenRef = useRef<string | null>(null);

  const onBestMoveRef = useRef(onBestMove);
  const onEvalRef = useRef(onEval);
  const onEngineLineRef = useRef(onEngineLine);
  onBestMoveRef.current = onBestMove;
  onEvalRef.current = onEval;
  onEngineLineRef.current = onEngineLine;

  useEffect(() => {
    const worker = new Worker(STOCKFISH_ENGINE_URL);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = event.data;
      onEngineLineRef.current?.(line);

      if (line === "uciok") {
        setEngineReady(true);
        return;
      }

      const fen = searchFenRef.current;
      if (fen) {
        const side = sideToMoveFromFen(fen);
        const evalCp = parseUciEval(line, side);
        if (evalCp !== null) {
          lastEvalRef.current = evalCp;
          onEvalRef.current?.(evalCp);
        }
      }

      const best = parseBestMove(line);
      if (best) {
        onBestMoveRef.current?.({
          uci: best,
          evalCp: lastEvalRef.current,
        });
        searchFenRef.current = null;
      }
    };

    worker.postMessage("uci");

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const postCommand = useCallback((cmd: string) => {
    workerRef.current?.postMessage(cmd);
  }, []);

  const stop = useCallback(() => {
    postCommand("stop");
    searchFenRef.current = null;
  }, [postCommand]);

  const newGame = useCallback(() => {
    stop();
    postCommand("ucinewgame");
    lastEvalRef.current = null;
  }, [postCommand, stop]);

  const requestMove = useCallback(
    (fen: string) => {
      if (!workerRef.current || !engineReady) return;
      searchFenRef.current = fen;
      lastEvalRef.current = null;
      postCommand(`position fen ${fen}`);
      postCommand(`go depth ${depth}`);
    },
    [depth, engineReady, postCommand],
  );

  const getLastEval = useCallback(() => lastEvalRef.current, []);

  return {
    engineReady,
    requestMove,
    stop,
    newGame,
    getLastEval,
    postCommand,
  };
}

export {
  STOCKFISH_DEPTH,
  AI_PLAY_DELAY_MIN_MS,
  AI_PLAY_DELAY_MAX_MS,
  randomPlayDelayMs,
} from "@/lib/stockfishUci";
