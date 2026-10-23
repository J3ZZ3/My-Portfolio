import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Brain, Activity, Trophy, Crown, Loader2 } from "lucide-react";
import arcadeData from "@/data/arcade.json";
import { fetchLeaderboard, type GameId, type LeaderboardEntry } from "@/lib/leaderboard";
import { leaderboardMessage } from "@/lib/releaseState";
const CyberRun = lazy(() =>
  import("./cyber-run/CyberRun").then((m) => ({ default: m.CyberRun })),
);
const MemoryMatrix = lazy(() =>
  import("./memory-matrix/MemoryMatrix").then((m) => ({ default: m.MemoryMatrix })),
);
const BinaryBreaker = lazy(() =>
  import("./binary-breaker/BinaryBreaker").then((m) => ({ default: m.BinaryBreaker })),
);
const ChessGame = lazy(() =>
  import("./neon-chess/ChessGame").then((m) => ({ default: m.ChessGame })),
);

function GameFallback({ label }: { label: string }) {
  return (
    <div className="h-full flex items-center justify-center font-pixel text-yellow-400 gap-2 text-center px-4">
      <Loader2 className="w-5 h-5 animate-spin" />
      {label}
    </div>
  );
}

export function ArcadeView() {
  const [selectedGame, setSelectedGame] = useState<
    "menu" | "run" | "memory" | "breaker" | "chess"
  >("menu");

  if (selectedGame === "run") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <Suspense fallback={<GameFallback label="LOADING_CYBER_RUN..." />}>
          <CyberRun gameId="run" />
        </Suspense>
      </GameWrapper>
    );
  }
  if (selectedGame === "memory") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <Suspense fallback={<GameFallback label="LOADING_MEMORY_MATRIX..." />}>
          <MemoryMatrix gameId="memory" />
        </Suspense>
      </GameWrapper>
    );
  }
  if (selectedGame === "breaker") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <Suspense fallback={<GameFallback label="LOADING_BINARY_BREAKER..." />}>
          <BinaryBreaker gameId="breaker" />
        </Suspense>
      </GameWrapper>
    );
  }
  if (selectedGame === "chess") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <Suspense fallback={<GameFallback label="LOADING_NEON_CHESS..." />}>
          <ChessGame gameId="chess" />
        </Suspense>
      </GameWrapper>
    );
  }

  return (
    <div className="h-full w-full p-6 overflow-y-auto font-terminal">
      <h2 className="text-xl md:text-2xl leading-tight font-pixel text-yellow-400 mb-8 flex flex-wrap items-center gap-2 md:gap-4">
        <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
        <span className="break-words">ARCADE_SYSTEM</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {arcadeData.games.map((game) => {
          const iconMap = { Activity, Brain, Gamepad2, Crown };
          const Icon = iconMap[game.icon as keyof typeof iconMap] ?? Gamepad2;
          return (
        <GameCard
              key={game.id}
              gameId={game.id as GameId}
              title={game.title}
              icon={Icon}
              desc={game.desc}
              color={game.color}
              borderColor={game.borderColor}
              onClick={() =>
                setSelectedGame(game.id as "run" | "memory" | "breaker" | "chess")
              }
        />
          );
        })}
      </div>
    </div>
  );
}

function GameCard({
  gameId,
  title,
  icon: Icon,
  desc,
  color,
  borderColor,
  onClick,
}: {
  gameId: GameId;
  title: string;
  icon: typeof Activity;
  desc: string;
  color: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-4 sm:p-6 border-4 ${borderColor} bg-black/50 text-left group
        hover:bg-white/5 transition-colors flex flex-col justify-between min-h-0
      `}
    >
      <div className="space-y-2">
        <Icon className={`w-12 h-12 ${color} mb-4`} />
        <h3 className={`text-lg md:text-xl leading-tight font-bold font-pixel ${color} break-words`}>
          {title}
        </h3>
        <p className="text-muted-foreground font-hud text-sm leading-relaxed">{desc}</p>
      </div>
      <ArcadeCardLeaderboard gameId={gameId} color={color} />
    </motion.button>
  );
}

function ArcadeCardLeaderboard({ gameId, color }: { gameId: GameId; color: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    fetchLeaderboard(gameId).then((data) => {
      if (!active) return;
      if (!data.ok) {
        setOffline(true);
        setEntries([]);
        return;
      }
      setOffline(false);
      setEntries(data.entries.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, [gameId]);

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <div className={`flex items-center gap-1 font-pixel text-xs ${color} mb-2`}>
        <Trophy className="w-3 h-3" />
        TOP_3
      </div>
      <div className="space-y-1 font-hud text-xs text-muted-foreground">
        {offline ? (
          <p className="font-terminal text-sm text-yellow-300 whitespace-pre-line">{leaderboardMessage("offline")}</p>
        ) : (
          [0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between gap-2">
              <span>#{i + 1}</span>
              <span className="truncate text-white/80 flex-1 text-right">
                {entries[i]?.name ?? "---"}
              </span>
              <span className="font-pixel">{entries[i]?.score ?? "-"}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function GameWrapper({ children, onBack }: { children: React.ReactNode, onBack: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <button 
          onClick={onBack}
          className="min-h-11 text-muted-foreground hover:text-white flex items-center gap-2 font-pixel text-xs"
        >
          &lt; BACK_TO_ARCADE
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
