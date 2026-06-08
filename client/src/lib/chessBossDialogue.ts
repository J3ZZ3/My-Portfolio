export type DialogueTrigger =
  | "gameStart"
  | "playerMove"
  | "playerCapture"
  | "playerCheck"
  | "aiCapture"
  | "aiCheck"
  | "aiWinning"
  | "aiOutplayed"
  | "aiPanicking"
  | "aiThinking"
  | "playerWin"
  | "aiWin"
  | "draw";

const LINES: Record<DialogueTrigger, string[]> = {
  gameStart: [
    "Another mortal enters my domain. Your fate is already sealed.",
    "I am NULLSPAWN. Bow before the end of all things.",
    "Cute. You brought a pawn to an apocalypse.",
  ],
  playerMove: [
    "Predictable. The void yawns at your mediocrity.",
    "That move reeks of mortal desperation.",
    "Keep squirming. I own the center of this doomed board.",
  ],
  playerCapture: [
    "Fine. That piece was expendable flesh-code.",
    "You took scraps. Enjoy them while you can.",
    "Congratulations on stealing my discarded spawn.",
  ],
  playerCheck: [
    "Check? A glitch in my infinite design...",
    "Do not celebrate. Your end is still inevitable.",
    "Cute fork. Still beneath me, mortal.",
  ],
  aiCapture: [
    "Deleted. Your piece had no soul backup.",
    "Consumed. File not found — forever.",
    "Thanks for the sacrifice, pitiful user.",
  ],
  aiCheck: [
    "Check. Run while your existence still compiles.",
    "Your king is exposed. Kneel or perish.",
    "I ALLOWED you to walk into that. Check.",
  ],
  aiWinning: [
    "You are bleeding eval. Accept oblivion.",
    "My advantage is apocalyptic. Yours is dust.",
    "This position is mine. You were always a guest.",
  ],
  aiOutplayed: [
    "…Tch. Lucky. NULLSPAWN will not fall twice.",
    "Anomaly detected. Do not mistake this for hope.",
    "Fine. One good move. Still doomed, mortal.",
  ],
  aiPanicking: [
    "STOP CHEERING. This corruption is TEMPORARY.",
    "IMPOSSIBLE. My search depth pierces eternity.",
    "You are cheating. There is no other explanation.",
  ],
  aiThinking: [
    "Calculating your extinction...",
    "Scanning all paths to your demise...",
    "Hold still. I am choosing your ending.",
    "Processing. Do not touch my plague board.",
  ],
  playerWin: [
    "IMPOSSIBLE. You cheated the apocalypse itself...",
    "Fine. You win this cycle. NULLSPAWN will return.",
    "NULLSPAWN purged... for now. I hate you. Checkmate accepted.",
  ],
  aiWin: [
    "Checkmate. Your fate is sealed. Uninstall yourself.",
    "Game over. NULLSPAWN has consumed your king.",
    "You lost. Logged, mocked, and forgotten by time.",
  ],
  draw: [
    "Stalemate. Even you cannot lose properly, mortal.",
    "Draw? Pathetic. Neither of us claims victory. Typical.",
    "Locked board. You wasted both our eternities.",
  ],
};

export function pickLine(
  trigger: DialogueTrigger,
  recentLines: string[] = [],
): string {
  const pool = LINES[trigger];
  const candidates = pool.filter((line) => !recentLines.includes(line));
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)] ?? pool[0];
}

export const DIALOGUE_COOLDOWN_MS = 1500;

export function evalSwingAgainstAi(prevCp: number | null, nextCp: number | null): number {
  if (prevCp === null || nextCp === null) return 0;
  return prevCp - nextCp;
}
