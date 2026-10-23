import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isValidGameId, sanitizePlayerName, validateScore } from "./leaderboardRules";

describe("leaderboard rules", () => {
  it("allows only the four arcade game ids", () => {
    for (const gameId of ["run", "memory", "breaker", "chess"]) {
      assert.equal(isValidGameId(gameId), true);
    }
    assert.equal(isValidGameId("pong"), false);
    assert.equal(isValidGameId("chess "), false);
  });

  it("rejects non-integers and scores above the game cap", () => {
    assert.equal(validateScore("run", 10.5), null);
    assert.equal(validateScore("run", 0), null);
    assert.equal(validateScore("run", 1_000_001), null);
    assert.equal(validateScore("memory", 501), null);
    assert.equal(validateScore("breaker", 1_001), null);
    assert.equal(validateScore("chess", 101), null);
    assert.equal(validateScore("run", Number.NaN), null);
    assert.equal(validateScore("run", "12"), null);
  });

  it("accepts integer scores inside each cap", () => {
    assert.equal(validateScore("run", 1_000_000), 1_000_000);
    assert.equal(validateScore("memory", 500), 500);
    assert.equal(validateScore("breaker", 1_000), 1_000);
    assert.equal(validateScore("chess", 100), 100);
  });

  it("accepts 2-16 letter, number, and space names", () => {
    assert.equal(sanitizePlayerName("  Koji  1 "), "Koji 1");
    assert.equal(sanitizePlayerName("ab"), "ab");
    assert.equal(sanitizePlayerName("a"), null);
    assert.equal(sanitizePlayerName("name-with-symbol"), null);
    assert.equal(sanitizePlayerName("!!!!!!!!!!!!!!!!"), null);
    assert.equal(sanitizePlayerName("a".repeat(17)), null);
  });
});
