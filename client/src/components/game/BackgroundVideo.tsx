import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gridBg from "@assets/generated_images/retro_synthwave_grid_background.png";

type VideoSource = { src: string; type: string };

// Available clips. On each load we rotate the starting clip to cycle backgrounds across reloads.
const allSources: VideoSource[] = [
  { src: "/bg.mp4", type: "video/mp4" },
  { src: "/neon.mp4", type: "video/mp4" },
];

interface BackgroundVideoProps {
  // Increment this number to force switching to the next background immediately.
  cycleKey?: number;
}

export function BackgroundVideo({ cycleKey }: BackgroundVideoProps) {
  const total = allSources.length || 1;
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle every 7 seconds.
  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % total);
    }, 12000);
    return () => window.clearInterval(id);
  }, [total]);

  // Manual cycle trigger (e.g., from the button).
  useEffect(() => {
    if (typeof cycleKey === "number") {
      setActiveIndex((i) => (i + 1) % total);
    }
  }, [cycleKey, total]);

  const handleError = () => {
    // Skip to next if current fails.
    setActiveIndex((i) => (i + 1) % total);
  };

  const current = allSources[activeIndex % total];

  return (
    <div className="absolute inset-0 z-0">
      <AnimatePresence mode="wait">
        {current && (
          <motion.video
            key={`${current.src}-${activeIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            autoPlay
            loop
            muted
            playsInline
            onError={handleError}
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
          >
            <source src={current.src} type={current.type} />
          </motion.video>
        )}
      </AnimatePresence>

      {/* Fallback Image (used if all sources error or none provided) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${gridBg})`,
          opacity: 0,
          filter: "hue-rotate(45deg) contrast(1.2)",
        }}
      />

      {/* CRT Scanlines Overlay - baked into background component for consistency */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-20 pointer-events-none" />
    </div>
  );
}
