import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { audio } from "@/lib/audio";

interface BootSequenceProps {
  onComplete: () => void;
}

const sequence = [
  "INITIALIZING SYSTEM CORE...",
  "LOADING KERNEL MODULES... OK",
  "MOUNTING FILE SYSTEM... OK",
  "CHECKING MEMORY INTEGRITY... 100%",
  "ESTABLISHING SECURE CONNECTION...",
  "LOADING USER PROFILE... DONE",
  "SYSTEM READY.",
];

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [lines, setLines] = useState<string[]>([]);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const finish = () => onCompleteRef.current();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setLines(sequence);
      const done = window.setTimeout(finish, 400);
      return () => window.clearTimeout(done);
    }

    let currentIndex = 0;
    let done = 0;
    const interval = window.setInterval(() => {
      if (currentIndex >= sequence.length) {
        window.clearInterval(interval);
        done = window.setTimeout(finish, 1000);
        return;
      }
      const line = sequence[currentIndex];
      setLines((prev) => [...prev, line]);
      audio.playTyping();
      currentIndex += 1;
    }, 400);

    return () => {
      window.clearInterval(interval);
      if (done) window.clearTimeout(done);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-start justify-start p-4 sm:p-8 font-terminal text-primary text-lg sm:text-xl overflow-y-auto">
      <div className="space-y-2">
        {lines.map((line) => (
          <motion.div key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <span className="text-muted-foreground">&gt;</span>
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
