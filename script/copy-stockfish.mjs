import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules", "stockfish", "bin");
const destDir = join(root, "client", "public", "stockfish");

const files = [
  "stockfish-18-lite-single.js",
  "stockfish-18-lite-single.wasm",
];

if (!existsSync(srcDir)) {
  console.warn("[copy-stockfish] stockfish not installed, skipping");
  process.exit(0);
}

mkdirSync(destDir, { recursive: true });

for (const file of files) {
  copyFileSync(join(srcDir, file), join(destDir, file));
  console.log(`[copy-stockfish] copied ${file}`);
}
