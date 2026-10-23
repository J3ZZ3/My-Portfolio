export const CYBER_SPEED = 5;
export const CYBER_START_Y = 200;
export const BRICK_POINTS = 10;

export interface CyberRunSession {
  playerY: number;
  velocityY: number;
  obstacles: { x: number; width: number; height: number }[];
  frameCount: number;
  score: number;
  gameSpeed: number;
}

export function createCyberRunSession(): CyberRunSession {
  return {
    playerY: CYBER_START_Y,
    velocityY: 0,
    obstacles: [],
    frameCount: 0,
    score: 0,
    gameSpeed: CYBER_SPEED,
  };
}

export function nextPlaybackSession(current: number): number {
  return current + 1;
}

export function isPlaybackCurrent(active: number, captured: number): boolean {
  return active === captured;
}

export function pointerToCanvasX(
  clientX: number,
  rect: { left: number; width: number },
  canvasWidth: number,
): number {
  if (rect.width <= 0) return 0;
  return ((clientX - rect.left) * canvasWidth) / rect.width;
}

export function clampPaddle(x: number, canvasWidth: number, paddleWidth: number): number {
  const max = Math.max(0, canvasWidth - paddleWidth);
  return Math.min(max, Math.max(0, x));
}

export function hitBrick(
  score: number,
  bricksLeft: number,
): { score: number; bricksLeft: number; cleared: boolean } {
  const bricksRemaining = bricksLeft - 1;
  return {
    score: score + BRICK_POINTS,
    bricksLeft: bricksRemaining,
    cleared: bricksRemaining <= 0,
  };
}

export interface QualifyGuard {
  qualified: boolean;
}

export function createQualifyGuard(): QualifyGuard {
  return { qualified: false };
}

export function claimQualification(guard: QualifyGuard): boolean {
  if (guard.qualified) return false;
  guard.qualified = true;
  return true;
}

export function resetQualification(guard: QualifyGuard): void {
  guard.qualified = false;
}

export function readStoredBest(read: () => string | null): number {
  try {
    const value = Number(read());
    if (!Number.isInteger(value) || value < 0) return 0;
    return value;
  } catch {
    return 0;
  }
}

export function writeStoredBest(write: (value: string) => void, score: number): boolean {
  try {
    write(String(score));
    return true;
  } catch {
    return false;
  }
}
