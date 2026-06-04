import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Brain, Activity, Trophy } from "lucide-react";
import arcadeData from "@/data/arcade.json";
import { fetchLeaderboard, type GameId, type LeaderboardEntry } from "@/lib/leaderboard";
import { CyberRun } from "./CyberRun";
import { MemoryMatrix } from "./MemoryMatrix";
import { BinaryBreaker } from "./BinaryBreaker";

export function ArcadeView() {
  const [selectedGame, setSelectedGame] = useState<"menu" | "run" | "memory" | "breaker">("menu");

  if (selectedGame === "run") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <CyberRun gameId="run" />
      </GameWrapper>
    );
  }
  if (selectedGame === "memory") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <MemoryMatrix gameId="memory" />
      </GameWrapper>
    );
  }
  if (selectedGame === "breaker") {
    return (
      <GameWrapper onBack={() => setSelectedGame("menu")}>
        <BinaryBreaker gameId="breaker" />
      </GameWrapper>
    );
  }

  return (
    <div className="h-full w-full p-6 overflow-y-auto font-terminal">
      <h2 className="text-xl md:text-2xl leading-tight font-pixel text-yellow-400 mb-8 flex flex-wrap items-center gap-2 md:gap-4">
        <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
        <span className="break-words">ARCADE_SYSTEM</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {arcadeData.games.map((game) => {
          const iconMap = { Activity, Brain, Gamepad2 };
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
              onClick={() => setSelectedGame(game.id as "run" | "memory" | "breaker")}
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
        relative p-6 border-4 ${borderColor} bg-black/50 text-left group
        hover:bg-white/5 transition-colors min-h-64 flex flex-col justify-between
      `}
    >
      <div className="space-y-2">
        <Icon className={`w-12 h-12 ${color} mb-4`} />
        <h3 className={`text-lg md:text-xl leading-tight font-bold font-pixel ${color} break-words`}>
          {title}
        </h3>
        <p className="text-muted-foreground font-hud text-sm leading-snug">{desc}</p>
      </div>
      <ArcadeCardLeaderboard gameId={gameId} color={color} />
    </motion.button>
  );
}

function ArcadeCardLeaderboard({ gameId, color }: { gameId: GameId; color: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchLeaderboard(gameId).then((data) => setEntries(data.entries.slice(0, 3)));
  }, [gameId]);

  return (
    <div className="mt-4 border-t border-white/10 pt-3">
      <div className={`flex items-center gap-1 font-pixel text-[10px] ${color} mb-2`}>
        <Trophy className="w-3 h-3" />
        TOP_3
      </div>
      <div className="space-y-1 font-hud text-[10px] text-muted-foreground">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex justify-between gap-2">
            <span>#{i + 1}</span>
            <span className="truncate text-white/80 flex-1 text-right">
              {entries[i]?.name ?? "---"}
            </span>
            <span className="font-pixel">{entries[i]?.score ?? "-"}</span>
          </div>
        ))}
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
          className="text-muted-foreground hover:text-white flex items-center gap-2 font-pixel text-xs"
        >
          &lt; BACK_TO_ARCADE
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
