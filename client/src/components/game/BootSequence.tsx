import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  
  const sequence = [
    "INITIALIZING SYSTEM CORE...",
    "LOADING KERNEL MODULES... OK",
    "MOUNTING FILE SYSTEM... OK",
    "CHECKING MEMORY INTEGRITY... 100%",
    "ESTABLISHING SECURE CONNECTION...",
    "LOADING USER PROFILE... DONE",
    "SYSTEM READY."
  ];

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex >= sequence.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
        return;
      }

      setLines(prev => [...prev, sequence[currentIndex]]);
      audio.playTyping();
      currentIndex++;
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-start justify-start p-8 font-terminal text-primary text-xl">
      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-muted-foreground">&gt;</span>
            {line}
          </motion.div>
        ))}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-3 h-5 bg-primary inline-block ml-2 align-middle"
        />
      </div>
    </div>
  );
}
