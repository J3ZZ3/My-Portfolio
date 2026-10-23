export const BOOT_SEEN_KEY = "koji-boot-seen";
export const AUDIO_PREFS_KEY = "koji-audio";

export const DEFAULT_VOLUME = 0.25;

export function effectGain(muted: boolean, volume: number): number {
  if (muted) return 0;
  const level = Number.isFinite(volume) ? Math.min(1, Math.max(0, volume)) : 0;
  return level * 0.4;
}

export function readBootSeen(read: () => string | null): boolean {
  try {
    return read() === "1";
  } catch {
    return false;
  }
}

export function markBootSeen(write: (value: string) => void): boolean {
  try {
    write("1");
    return true;
  } catch {
    return false;
  }
}

export interface AudioPrefs {
  muted: boolean;
  volume: number;
}

export function readAudioPrefs(read: () => string | null): AudioPrefs {
  const fallback = { muted: false, volume: DEFAULT_VOLUME };
  try {
    const raw = read();
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { muted?: unknown; volume?: unknown };
    const volume =
      typeof parsed.volume === "number" && Number.isFinite(parsed.volume)
        ? Math.min(1, Math.max(0, parsed.volume))
        : DEFAULT_VOLUME;
    return { muted: parsed.muted === true, volume };
  } catch {
    return fallback;
  }
}

export function writeAudioPrefs(write: (value: string) => void, prefs: AudioPrefs): boolean {
  try {
    write(JSON.stringify({ muted: prefs.muted, volume: prefs.volume }));
    return true;
  } catch {
    return false;
  }
}

export type BoardStatus = "loading" | "offline" | "empty" | "ready";

export function leaderboardMessage(status: BoardStatus): string {
  if (status === "loading") return "> SYNCING RANKINGS...";
  if (status === "offline") return "LINK_LOST\nLeaderboard temporarily unavailable.";
  if (status === "empty") return "---";
  return "";
}
