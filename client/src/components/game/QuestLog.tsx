import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Sword, ExternalLink, PlayCircle } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  desc: string;
  status: "complete" | "in-progress" | "locked";
  tech: string[];
  links?: {
    demo?: boolean;
    view?: boolean;
  };
}

const QUESTS: Quest[] = [
  {
    id: 1,
    title: "ONLINE MARKETPLACE",
    desc: "A React and Node.js-based marketplace for users to buy and sell products.",
    status: "complete",
    tech: ["React.js", "Node.js", "Firebase", "Redux"],
    links: { demo: true, view: true }
  },
  {
    id: 2,
    title: "EMPLOYEE MANAGEMENT SYS",
    desc: "A CRUD application to manage employee details with authentication and admin functionalities.",
    status: "complete",
    tech: ["React.js", "Firebase", "Node.js", "Express.js"],
    links: { demo: true, view: true }
  },
  {
    id: 3,
    title: "AUDIO RECORDER APP",
    desc: "A React Native app for recording and managing voice notes.",
    status: "complete",
    tech: ["React Native"],
    links: { view: true }
  },
  {
    id: 4,
    title: "WEATHER APP",
    desc: "Modern app providing real-time weather information, hourly forecasts, and weekly forecasts.",
    status: "complete",
    tech: ["React", "CSS", "WeatherAPI", "Axios"],
    links: { demo: true, view: true }
  }
];

export function QuestLog() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h2 className="text-2xl font-pixel text-secondary mb-6 flex items-center gap-4">
        <Sword className="w-6 h-6" />
        QUEST_LOG
      </h2>

      <div className="grid grid-cols-1 gap-4 pb-4">
        {QUESTS.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-4 border-l-4 font-hud bg-black/40 hover:bg-white/5 transition-colors group
              ${quest.status === 'complete' ? 'border-primary' : 'border-muted'}
            `}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
              <h3 className="text-xl font-bold tracking-wider text-primary group-hover:text-white transition-colors">
                {quest.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-primary flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 border border-primary/30">
                  <CheckCircle2 className="w-3 h-3"/> COMPLETED
                </span>
              </div>
            </div>

            <p className="text-muted-foreground font-terminal text-lg mb-4 leading-relaxed">
              {quest.desc}
            </p>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="flex flex-wrap gap-2">
                {quest.tech.map((t) => (
                  <span key={t} className="px-2 py-1 text-xs border border-accent/30 text-accent bg-accent/5 font-mono">
                    {t}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-3">
                {quest.links?.demo && (
                  <button className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors uppercase font-bold tracking-wide">
                    <PlayCircle className="w-4 h-4" /> Demo
                  </button>
                )}
                {quest.links?.view && (
                  <button className="flex items-center gap-2 text-sm text-white hover:text-secondary transition-colors uppercase font-bold tracking-wide">
                    <ExternalLink className="w-4 h-4" /> View Project
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
