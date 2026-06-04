import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/leaderboard";

interface LeaderboardPanelProps {
  entries: LeaderboardEntry[];
  loading?: boolean;
  accentClass?: string;
}

export function LeaderboardPanel({
  entries,
  loading = false,
  accentClass = "text-primary",
}: LeaderboardPanelProps) {
  const slots: (LeaderboardEntry | null)[] = [0, 1, 2].map(
    (i) => entries[i] ?? null,
  );

  return (
    <div className="w-full max-w-2xl mb-4 border border-white/10 bg-black/40 p-3">
      <div className={`flex items-center gap-2 mb-2 font-pixel text-xs ${accentClass}`}>
        <Trophy className="w-4 h-4" />
        TOP_3_LEADERBOARD
      </div>
      {loading ? (
        <p className="font-terminal text-xs text-muted-foreground">&gt; SYNCING RANKINGS...</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 font-hud text-xs">
          {slots.map((entry, i) => (
            <div
              key={i}
              className="border border-white/10 p-2 text-center bg-black/30"
            >
              <div className={`font-pixel ${accentClass}`}>#{i + 1}</div>
              {entry ? (
                <>
                  <div className="truncate text-white mt-1">{entry.name}</div>
                  <div className="text-muted-foreground font-pixel mt-1">
                    {entry.score}
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground mt-1 font-terminal">---</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
