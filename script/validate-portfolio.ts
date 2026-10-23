import assert from "node:assert/strict";
import { buildKojiSystemPrompt } from "../shared/kojiPrompt";

const prompt = buildKojiSystemPrompt();

const required = [
  "Jesse Mashoana",
  "Junior Developer (Web & Mobile)",
  "Pretoria, South Africa",
  "jesse.mashoana@gmail.com",
  "https://github.com/J3ZZ3",
  "mLab Southern Africa",
  "XNext ISP",
  "September 2025",
  "September 2026",
  "CodeTribe Academy",
  "React Course",
  "completed April 2025",
  "Mobile Applications Laboratory (mLab)",
  "STEP UP I Programme",
  "awarded September 2026",
  "cloud systems administration",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Linux",
  "Coolify",
  "Online Marketplace",
  "FitTrack",
  "Not publicly launched",
  "Listify — Shopping List",
  "Audio Recorder",
  "Weather App",
  "https://pillock.vercel.app/",
  "https://github.com/J3ZZ3/Marketplace",
  "https://github.com/J3ZZ3/Expo_Shopping_List",
  "https://github.com/J3ZZ3/Expo_Shopping_List/releases/download/shopping-list/Listify.apk",
  "PROFILE",
  "QUESTS",
  "SKILLS",
  "ARCADE",
  "COMMS",
  "Neon Chess",
];

for (const value of required) {
  assert.ok(prompt.includes(value), `prompt is missing ${value}`);
}

assert.equal(prompt.includes("JOURNEY"), false, "prompt mentions JOURNEY");
assert.equal(/junior frontend/i.test(prompt), false, "prompt mentions Junior frontend");
assert.equal(/linkedin/i.test(prompt), false, "prompt mentions LinkedIn");
assert.equal(/\bphone\b/i.test(prompt), false, "prompt mentions a phone");
assert.equal(prompt.includes("GROQ_API_KEY"), false, "prompt includes an API key name");
assert.equal(
  prompt.includes("Backend-Focused Full-Stack Developer"),
  false,
  "prompt uses the retired title",
);
assert.equal(prompt.includes("%"), false, "prompt includes a percentage");

const fitTrack = prompt.split("\n").find((line) => line.includes("FitTrack"));
assert.ok(fitTrack, "prompt is missing the FitTrack entry");
assert.equal(fitTrack.includes("http"), false, "FitTrack entry includes a URL");
assert.equal(/primal male/i.test(prompt), false, "prompt mentions Primal Male");

console.log("portfolio content ok");
