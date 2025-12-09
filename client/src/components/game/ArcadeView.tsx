import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Brain, Activity } from "lucide-react";
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
      <h2 className="text-2xl font-pixel text-yellow-400 mb-8 flex items-center gap-4">
        <Gamepad2 className="w-8 h-8" />
        ARCADE_SYSTEM
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Game 1: Cyber Run */}
        <GameCard 
          title="CYBER_RUN" 
          icon={Activity} 
          desc="Endless runner. Compile code by avoiding bugs."
          color="text-primary"
          borderColor="border-primary"
          onClick={() => setSelectedGame("run")}
        />

        {/* Game 2: Memory Matrix */}
        <GameCard 
          title="MEMORY_MATRIX" 
          icon={Brain} 
          desc="Pattern recognition test. Enhance cognitive RAM."
          color="text-secondary"
          borderColor="border-secondary"
          onClick={() => setSelectedGame("memory")}
        />

        {/* Game 3: Binary Breaker */}
        <GameCard 
          title="BINARY_BREAKER" 
          icon={Gamepad2} 
          desc="Breakout clone. Smash through firewalls."
          color="text-accent"
          borderColor="border-accent"
          onClick={() => setSelectedGame("breaker")}
        />
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
      <div>
        <Icon className={`w-12 h-12 ${color} mb-4`} />
        <h3 className={`text-xl font-bold font-pixel ${color} mb-2`}>{title}</h3>
        <p className="text-muted-foreground font-hud text-sm">{desc}</p>
      </div>
      <div className={`
        text-xs font-mono px-2 py-1 border ${borderColor} ${color} w-fit
        group-hover:bg-white/10
      `}>
        INSERT COIN
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
