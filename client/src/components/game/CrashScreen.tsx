import { useEffect } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

interface CrashScreenProps {
  onComplete: () => void;
}

export function CrashScreen({ onComplete }: CrashScreenProps) {
  useEffect(() => {
    audio.playCrash();
    
    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-blue-900 font-terminal text-white p-8 overflow-hidden">
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-pulse pointer-events-none" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />

      <div className="max-w-4xl mx-auto mt-20 space-y-8 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white text-blue-900 px-2 w-fit font-bold"
        >
          *** SYSTEM FAILURE ***
        </motion.div>

        <p className="text-xl">
          A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36. The current application will be terminated.
        </p>

        <ul className="list-disc list-inside space-y-2 text-lg">
          <li>Press any key to terminate the current application.</li>
          <li>Press CTRL+ALT+DEL again to restart your computer. You will lose any unsaved information in all applications.</li>
        </ul>

        <div className="mt-20 animate-pulse">
          Press any key to continue _
        </div>
      </div>
      
      {/* Random Glitch Blocks */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white mix-blend-difference"
          initial={{ 
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: Math.random() * 200,
            height: Math.random() * 20,
            opacity: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            x: [0, Math.random() * 20 - 10],
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatDelay: Math.random() * 0.5,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}
