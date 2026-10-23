import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { API_ERRORS } from "./apiErrors";
import { parseChatRequest } from "./chatRequest";

const secret = "GROQ_API_KEY super-secret-token";

function user(content: string) {
  return { role: "user", content };
}

describe("chat requests", () => {
  it("accepts a normal user and assistant exchange", () => {
    const parsed = parseChatRequest({
      body: {
        messages: [user("What projects have you built?"), { role: "assistant", content: "Online Marketplace." }],
      },
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.messages.length, 2);
    assert.equal(parsed.messages[0].content, "What projects have you built?");
  });

  it("rejects system and tool roles without echoing them", () => {
    for (const role of ["system", "tool"]) {
      const parsed = parseChatRequest({
        body: { messages: [{ role, content: secret }] },
      });
      assert.equal(parsed.ok, false);
      if (parsed.ok) return;
      assert.equal(parsed.status, 400);
      assert.equal(parsed.body.code, "invalid_request");
      assert.equal(parsed.body.error, "Unsupported message.");
      assert.equal(JSON.stringify(parsed).includes(secret), false);
    }
  });

  it("rejects an over-long message", () => {
    const parsed = parseChatRequest({
      body: { messages: [user(`${"a".repeat(501)} ${secret}`)] },
    });
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.equal(parsed.body.error, "Message is too long.");
    assert.equal(JSON.stringify(parsed).includes(secret), false);
  });

  it("rejects more than 12 messages", () => {
    const parsed = parseChatRequest({
      body: { messages: Array.from({ length: 13 }, () => user("hello")) },
    });
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.equal(parsed.body.error, "Too many messages.");
  });

  it("rejects malformed JSON", () => {
    const parsed = parseChatRequest({ body: "{not-json" });
    assert.equal(parsed.ok, false);
    if (parsed.ok) return;
    assert.equal(parsed.status, 400);
    assert.equal(parsed.body.error, "Request could not be read.");
  });

  it("keeps public error text free of credentials", () => {
    const blob = JSON.stringify(API_ERRORS);
    assert.equal(blob.includes("GROQ_API_KEY"), false);
    assert.equal(blob.includes("UPSTASH"), false);
    assert.equal(blob.toLowerCase().includes("token"), false);
    assert.equal(blob.includes(secret), false);
  });
});
