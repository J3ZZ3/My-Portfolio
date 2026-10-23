import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUDIO_PREFS_KEY,
  BOOT_SEEN_KEY,
  effectGain,
  leaderboardMessage,
  markBootSeen,
  readAudioPrefs,
  readBootSeen,
  writeAudioPrefs,
} from "./releaseState.ts";

describe("audio gain", () => {
  it("silences effects while muted and restores the slider level", () => {
    assert.equal(effectGain(true, 0.25), 0);
    assert.equal(effectGain(false, 0), 0);
    assert.equal(effectGain(false, 0.25), 0.1);
    assert.equal(effectGain(false, 1), 0.4);
    assert.equal(effectGain(false, 2), 0.4);
  });
});

describe("boot skip", () => {
  it("skips the typed boot only after it has been seen", () => {
    const store = new Map<string, string>();
    assert.equal(readBootSeen(() => store.get(BOOT_SEEN_KEY) ?? null), false);
    assert.equal(markBootSeen((value) => store.set(BOOT_SEEN_KEY, value)), true);
    assert.equal(readBootSeen(() => store.get(BOOT_SEEN_KEY) ?? null), true);
    assert.equal(readBootSeen(() => { throw new Error("blocked"); }), false);
  });
});

describe("audio preferences", () => {
  it("ignores broken storage and keeps a safe default", () => {
    assert.deepEqual(readAudioPrefs(() => { throw new Error("blocked"); }), {
      muted: false,
      volume: 0.25,
    });
    assert.equal(writeAudioPrefs(() => { throw new Error("blocked"); }, { muted: true, volume: 0.5 }), false);
    const store = new Map<string, string>();
    writeAudioPrefs((value) => store.set(AUDIO_PREFS_KEY, value), { muted: true, volume: 0.5 });
    assert.deepEqual(readAudioPrefs(() => store.get(AUDIO_PREFS_KEY) ?? null), {
      muted: true,
      volume: 0.5,
    });
  });
});

describe("leaderboard status", () => {
  it("separates loading, offline, and empty boards", () => {
    assert.match(leaderboardMessage("loading"), /SYNCING RANKINGS/);
    assert.match(leaderboardMessage("offline"), /LINK_LOST/);
    assert.match(leaderboardMessage("offline"), /Leaderboard temporarily unavailable/);
    assert.equal(leaderboardMessage("empty"), "---");
    assert.equal(leaderboardMessage("ready"), "");
  });
});
