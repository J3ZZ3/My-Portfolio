import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Brain, Activity } from "lucide-react";
import arcadeData from "@/data/arcade.json";
import { CyberRun } from "./CyberRun";
import { MemoryMatrix } from "./MemoryMatrix";
import { BinaryBreaker } from "./BinaryBreaker";

export function ArcadeView() {
  const [selectedGame, setSelectedGame] = useState<"menu" | "run" | "memory" | "breaker">("menu");

  if (selectedGame === "run") return <GameWrapper onBack={() => setSelectedGame("menu")}><CyberRun /></GameWrapper>;
  if (selectedGame === "memory") return <GameWrapper onBack={() => setSelectedGame("menu")}><MemoryMatrix /></GameWrapper>;
  if (selectedGame === "breaker") return <GameWrapper onBack={() => setSelectedGame("menu")}><BinaryBreaker /></GameWrapper>;

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
              title={game.title}
              icon={Icon}
              desc={game.desc}
              color={game.color}
              borderColor={game.borderColor}
              onClick={() => setSelectedGame(game.id as any)}
        />
          );
        })}
      </div>
    </div>
  );
}

function GameCard({ title, icon: Icon, desc, color, borderColor, onClick }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-6 border-4 ${borderColor} bg-black/50 text-left group
        hover:bg-white/5 transition-colors h-64 flex flex-col justify-between
      `}
    >
      <div className="space-y-2">
        <Icon className={`w-12 h-12 ${color} mb-4`} />
        <h3 className={`text-lg md:text-xl leading-tight font-bold font-pixel ${color} break-words`}>
          {title}
        </h3>
        <p className="text-muted-foreground font-hud text-sm leading-snug">{desc}</p>
      </div>
    </motion.button>
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
