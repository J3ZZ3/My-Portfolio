export const STOCKFISH_ENGINE_URL = "/stockfish/stockfish-18-lite-single.js";
export const STOCKFISH_DEPTH = 18;
export const AI_PLAY_DELAY_MIN_MS = 3000;
export const AI_PLAY_DELAY_MAX_MS = 6000;

export function randomPlayDelayMs(): number {
  return (
    AI_PLAY_DELAY_MIN_MS +
    Math.floor(Math.random() * (AI_PLAY_DELAY_MAX_MS - AI_PLAY_DELAY_MIN_MS + 1))
  );
}

/** Normalize UCI score to centipawns from black (AI) perspective. */
export function parseUciEval(line: string, sideToMove: "w" | "b"): number | null {
  if (!line.startsWith("info ")) return null;

  const mate = line.match(/\bscore mate (-?\d+)/);
  if (mate) {
    const m = parseInt(mate[1], 10);
    const cp = m > 0 ? 10000 - Math.abs(m) * 10 : -10000 + Math.abs(m) * 10;
    return sideToMove === "b" ? cp : -cp;
  }

  const cpMatch = line.match(/\bscore cp (-?\d+)/);
  if (cpMatch) {
    let cp = parseInt(cpMatch[1], 10);
    if (sideToMove === "w") cp = -cp;
    return cp;
  }

  return null;
}

export function parseBestMove(line: string): string | null {
  if (!line.startsWith("bestmove ")) return null;
  const move = line.split(" ")[1];
  if (!move || move === "(none)") return null;
  return move;
}

export function sideToMoveFromFen(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}
