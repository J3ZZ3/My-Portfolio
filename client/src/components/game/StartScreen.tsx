import { motion } from "framer-motion";
import { Play, RefreshCw } from "lucide-react";
import { useState } from "react";
import { BackgroundVideo } from "./BackgroundVideo";
import { audio } from "@/lib/audio";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [bgCycleKey, setBgCycleKey] = useState(0);

  const handleCycleBg = () => {
    setBgCycleKey((n) => n + 1);
  };

  const handleStart = () => {
    audio.playStart();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      <BackgroundVideo cycleKey={bgCycleKey} />

      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <button
          onClick={handleCycleBg}
          className="px-3 py-2 border border-primary/40 text-primary font-mono text-xs bg-black/40 hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          CHANGE BG
        </button>
      </div>

      <div className="z-20 flex flex-col items-center gap-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-8xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-primary to-emerald-800 animate-pulse filter drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
            REWORK
          </h1>
          <p className="text-lg md:text-2xl font-hud text-secondary tracking-[0.15em] md:tracking-[0.4em] uppercase">
            BY KOJI
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => audio.playHover()}
          onClick={handleStart}
          className="group relative px-8 py-4 bg-transparent overflow-hidden"
        >
          <div className="absolute inset-0 border-4 border-primary/50 group-hover:border-primary transition-colors" />
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          
          <span className="relative flex items-center gap-4 text-2xl font-pixel text-primary group-hover:text-white transition-colors animate-pulse">
            <Play className="w-6 h-6 fill-current" />
            PRESS START
          </span>
        </motion.button>
        
        <div className="mt-8 text-muted-foreground font-terminal text-sm">
          © 2025 SYSTEM_CORE // V.1.0.4
        </div>
      </div>
    </div>
  );
}
