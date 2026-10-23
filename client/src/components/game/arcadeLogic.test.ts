import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRICK_POINTS,
  CYBER_SPEED,
  claimQualification,
  clampPaddle,
  createCyberRunSession,
  createQualifyGuard,
  hitBrick,
  isPlaybackCurrent,
  nextPlaybackSession,
  pointerToCanvasX,
  readStoredBest,
  resetQualification,
  writeStoredBest,
} from "./arcadeLogic.ts";

describe("cyber run session", () => {
  it("starts every run at score zero with the same speed", () => {
    const first = createCyberRunSession();
    const retry = createCyberRunSession();
    assert.equal(first.score, 0);
    assert.equal(retry.score, 0);
    assert.equal(first.gameSpeed, CYBER_SPEED);
    assert.equal(retry.gameSpeed, CYBER_SPEED);
    assert.deepEqual(first.obstacles, []);
    assert.equal(first.velocityY, 0);
    assert.deepEqual(first, retry);
  });
});

describe("memory playback", () => {
  it("invalidates an older sequence when playback restarts", () => {
    let active = 1;
    const first = active;
    active = nextPlaybackSession(active);
    assert.equal(isPlaybackCurrent(active, first), false);
    assert.equal(isPlaybackCurrent(active, active), true);

    const second = active;
    active = nextPlaybackSession(active);
    assert.equal(isPlaybackCurrent(active, first), false);
    assert.equal(isPlaybackCurrent(active, second), false);
  });
});

describe("binary breaker", () => {
  it("converts a scaled pointer into canvas coordinates", () => {
    const x = pointerToCanvasX(150, { left: 50, width: 350 }, 700);
    assert.equal(x, 200);
    assert.equal(pointerToCanvasX(50, { left: 50, width: 0 }, 700), 0);
  });

  it("clamps the paddle inside the board", () => {
    assert.equal(clampPaddle(-20, 700, 100), 0);
    assert.equal(clampPaddle(680, 700, 100), 600);
    assert.equal(clampPaddle(40, 700, 100), 40);
  });

  it("scores the final brick once and clears the round", () => {
    const hit = hitBrick(390, 1);
    assert.equal(hit.score, 390 + BRICK_POINTS);
    assert.equal(hit.bricksLeft, 0);
    assert.equal(hit.cleared, true);
    const earlier = hitBrick(0, 40);
    assert.equal(earlier.score, 10);
    assert.equal(earlier.cleared, false);
  });
});

describe("qualification guard", () => {
  it("allows one qualification per completion", () => {
    const guard = createQualifyGuard();
    assert.equal(claimQualification(guard), true);
    assert.equal(claimQualification(guard), false);
    resetQualification(guard);
    assert.equal(claimQualification(guard), true);
  });
});

describe("local best storage", () => {
  it("ignores storage failures", () => {
    assert.equal(readStoredBest(() => { throw new Error("blocked"); }), 0);
    assert.equal(writeStoredBest(() => { throw new Error("blocked"); }, 20), false);
    assert.equal(readStoredBest(() => "12"), 12);
  });
});
