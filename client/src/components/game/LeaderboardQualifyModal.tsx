import { useState } from "react";
import { Trophy, X } from "lucide-react";

interface LeaderboardQualifyModalProps {
  open: boolean;
  gameTitle: string;
  score: number;
  submitting?: boolean;
  onSubmit: (name: string) => void | Promise<unknown>;
  onSkip: () => void;
}

export function LeaderboardQualifyModal({
  open,
  gameTitle,
  score,
  submitting = false,
  onSubmit,
  onSkip,
}: LeaderboardQualifyModalProps) {
  const [name, setName] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || submitting) return;
    void onSubmit(name.trim());
    setName("");
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-20 p-4">
      <div className="border-2 border-primary/50 bg-black p-6 max-w-sm w-full relative">
        <button
          type="button"
          onClick={onSkip}
          className="absolute top-3 right-3 text-muted-foreground hover:text-white"
          aria-label="Skip"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-primary font-pixel text-sm mb-3">
          <Trophy className="w-5 h-5" />
          LEADERBOARD_QUALIFIED
        </div>

        <p className="font-terminal text-sm text-white/90 mb-2">
          Congratulations! Your score of <span className="text-primary font-pixel">{score}</span> qualifies for the{" "}
          <span className="text-primary">{gameTitle}</span> top 3.
        </p>
        <p className="font-terminal text-xs text-muted-foreground mb-4">
          Enter your callsign to claim your rank.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={16}
            placeholder="Player name (2-16 chars)"
            className="w-full bg-black border-2 border-primary/50 text-primary p-2 font-mono text-sm focus:outline-none focus:border-primary"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || name.trim().length < 2}
              className="flex-1 py-2 bg-primary text-black font-pixel text-xs hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "UPLOADING..." : "SUBMIT"}
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="px-4 py-2 border border-white/20 text-muted-foreground font-pixel text-xs hover:text-white"
            >
              SKIP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface LeaderboardCongratsBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export function LeaderboardCongratsBanner({ message, onDismiss }: LeaderboardCongratsBannerProps) {
  if (!message) return null;

  return (
    <div className="w-full max-w-2xl mb-4 border border-primary/40 bg-primary/10 p-3 flex justify-between items-center gap-2">
      <p className="font-terminal text-sm text-primary">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs font-pixel text-muted-foreground hover:text-white shrink-0"
      >
        OK
      </button>
    </div>
  );
}
