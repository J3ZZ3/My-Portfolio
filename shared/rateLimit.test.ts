import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CHAT_BURST_LIMIT,
  CHAT_BURST_WINDOW_SECONDS,
  CHAT_DAILY_LIMIT,
  chatLimitChecks,
  consumeFixedWindow,
  enforceLimit,
  hashClientToken,
  limitHttpResponse,
  trustedClientToken,
  type CounterStore,
} from "./rateLimit";

function memoryStore() {
  const counts = new Map<string, number>();
  const ttls = new Map<string, number>();
  const expireCalls: string[] = [];
  const store: CounterStore = {
    async incr(key) {
      const next = (counts.get(key) ?? 0) + 1;
      counts.set(key, next);
      return next;
    },
    async expire(key, seconds) {
      expireCalls.push(key);
      if (!ttls.has(key)) ttls.set(key, seconds);
    },
    async ttl(key) {
      return ttls.get(key) ?? -1;
    },
  };
  return { store, expireCalls };
}

describe("rate limits", () => {
  it("allows the burst window and then returns retry information", async () => {
    const { store, expireCalls } = memoryStore();
    const key = "rl:chat:burst:test";
    for (let i = 0; i < CHAT_BURST_LIMIT; i += 1) {
      const decision = await consumeFixedWindow(store, key, CHAT_BURST_LIMIT, CHAT_BURST_WINDOW_SECONDS);
      assert.equal(decision.status, "allowed");
    }
    const blocked = await consumeFixedWindow(store, key, CHAT_BURST_LIMIT, CHAT_BURST_WINDOW_SECONDS);
    assert.equal(blocked.status, "limited");
    if (blocked.status !== "limited") return;
    assert.equal(blocked.retryAfterSeconds, CHAT_BURST_WINDOW_SECONDS);
    assert.equal(expireCalls.length, 1);

    const http = limitHttpResponse(blocked);
    assert.equal(http?.status, 429);
    assert.equal(http?.body.code, "rate_limited");
    assert.equal(http?.body.error, "Channel busy. Try again shortly.");
    assert.equal(http?.retryAfter, CHAT_BURST_WINDOW_SECONDS);
  });

  it("enforces the longer daily window on its own key", async () => {
    const { store } = memoryStore();
    const checks = chatLimitChecks("203.0.113.10");
    assert.equal(checks[1].limit, CHAT_DAILY_LIMIT);
    assert.notEqual(checks[0].key, checks[1].key);

    for (let i = 0; i < CHAT_DAILY_LIMIT; i += 1) {
      const decision = await consumeFixedWindow(store, checks[1].key, checks[1].limit, checks[1].windowSeconds);
      assert.equal(decision.status, "allowed");
    }
    const blocked = await enforceLimit({
      store,
      requireStore: true,
      checks: [checks[1]],
    });
    assert.equal(blocked.status, "limited");
    const http = limitHttpResponse(blocked);
    assert.equal(http?.status, 429);
  });

  it("reports an unavailable limiter instead of a rate limit", async () => {
    const store: CounterStore = {
      async incr() {
        throw new Error("redis down");
      },
      async expire() {
        return 1;
      },
      async ttl() {
        return 1;
      },
    };
    const decision = await enforceLimit({
      store,
      requireStore: true,
      checks: chatLimitChecks("203.0.113.10"),
    });
    assert.equal(decision.status, "unavailable");
    const http = limitHttpResponse(decision);
    assert.equal(http?.status, 503);
    assert.equal(http?.body.code, "unavailable");
    assert.equal(JSON.stringify(http).toLowerCase().includes("rate"), false);
  });

  it("skips limiting only when local storage is absent", async () => {
    const open = await enforceLimit({ store: null, requireStore: false, checks: [] });
    const closed = await enforceLimit({ store: null, requireStore: true, checks: [] });
    assert.equal(open.status, "allowed");
    assert.equal(closed.status, "unavailable");
    assert.equal(limitHttpResponse(closed)?.status, 503);
  });

  it("ignores forwarded headers on the node platform and does not store the raw address", () => {
    const token = trustedClientToken({
      platform: "node",
      headers: { "x-forwarded-for": "1.2.3.4", "x-real-ip": "5.6.7.8" },
      socketAddress: "127.0.0.1",
    });
    assert.equal(token, "127.0.0.1");
    const hashed = hashClientToken(token);
    assert.equal(hashed.includes("127.0.0.1"), false);
    assert.equal(hashed.includes("1.2.3.4"), false);

    const vercel = trustedClientToken({
      platform: "vercel",
      headers: { "x-real-ip": "203.0.113.9", "x-forwarded-for": "198.51.100.4, 203.0.113.9" },
    });
    assert.equal(vercel, "203.0.113.9");
  });
});
