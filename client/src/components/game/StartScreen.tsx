import { motion } from "framer-motion";
import { Play } from "lucide-react";
import gridBg from "@assets/generated_images/retro_synthwave_grid_background.png";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-40 z-0"
        style={{
          backgroundImage: `url(${gridBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'hue-rotate(45deg)' // Shift to purple/green
        }}
      />
      
      {/* Grid Animation Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />

      <div className="z-20 flex flex-col items-center gap-12">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center space-y-4"
        >
          <h1 className="text-6xl md:text-8xl font-pixel text-transparent bg-clip-text bg-gradient-to-b from-primary to-emerald-800 animate-pulse filter drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
            PLAYER ONE
          </h1>
          <p className="text-xl md:text-2xl font-hud text-secondary tracking-[0.5em] uppercase">
            Full Stack Developer Portfolio
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
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
