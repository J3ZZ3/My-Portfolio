import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Sword } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  desc: string;
  status: "complete" | "in-progress" | "locked";
  reward: string;
  tech: string[];
}

const QUESTS: Quest[] = [
  {
    id: 1,
    title: "E-COMMERCE PLATFORM",
    desc: "Build a scalable marketplace with payment integration.",
    status: "complete",
    reward: "XP +5000",
    tech: ["React", "Node.js", "Stripe"]
  },
  {
    id: 2,
    title: "SOCIAL DASHBOARD",
    desc: "Real-time analytics monitor for social metrics.",
    status: "complete",
    reward: "XP +3500",
    tech: ["D3.js", "Firebase", "Tailwind"]
  },
  {
    id: 3,
    title: "AI IMAGE GENERATOR",
    desc: "Interface for stable diffusion models.",
    status: "in-progress",
    reward: "XP +???",
    tech: ["Python", "React", "WebSockets"]
  },
  {
    id: 4,
    title: "BLOCKCHAIN EXPLORER",
    desc: "Visualize transaction blocks in 3D space.",
    status: "locked",
    reward: "LOCKED",
    tech: ["Three.js", "Web3"]
  }
];

export function QuestLog() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h2 className="text-2xl font-pixel text-secondary mb-6 flex items-center gap-4">
        <Sword className="w-6 h-6" />
        ACTIVE_QUESTS
      </h2>

      <div className="space-y-4">
        {QUESTS.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-4 border-l-4 font-hud
              ${quest.status === 'complete' ? 'border-primary bg-primary/5' : ''}
              ${quest.status === 'in-progress' ? 'border-accent bg-accent/5' : ''}
              ${quest.status === 'locked' ? 'border-muted bg-muted/10 opacity-50' : ''}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`text-xl font-bold tracking-wider ${
                quest.status === 'complete' ? 'text-primary' : 
                quest.status === 'in-progress' ? 'text-accent' : 'text-muted-foreground'
              }`}>
                {quest.title}
              </h3>
              <div className="flex items-center gap-2">
                {quest.status === 'complete' && <span className="text-primary flex items-center gap-1 text-sm"><CheckCircle2 className="w-4 h-4"/> COMPLETED</span>}
                {quest.status === 'in-progress' && <span className="text-accent flex items-center gap-1 text-sm"><Clock className="w-4 h-4 animate-spin-slow"/> ACTIVE</span>}
                {quest.status === 'locked' && <span className="text-muted-foreground flex items-center gap-1 text-sm"><Circle className="w-4 h-4"/> LOCKED</span>}
              </div>
            </div>

            <p className="text-muted-foreground font-terminal text-lg mb-3">
              {quest.desc}
            </p>

            <div className="flex justify-between items-end">
              <div className="flex gap-2">
                {quest.tech.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-xs border border-white/20 text-white/70 font-mono">
                    {t}
                  </span>
                ))}
              </div>
              <span className="text-secondary text-sm font-bold">{quest.reward}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
