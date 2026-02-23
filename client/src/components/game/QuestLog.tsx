import { motion } from "framer-motion";
import { CheckCircle2, Sword, ExternalLink, PlayCircle, Clock, Lock, Wifi, WifiOff } from "lucide-react";
import questsData from "@/data/quests.json";

export function QuestLog() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h2 className="text-2xl font-pixel text-secondary mb-6 flex items-center gap-4">
        <Sword className="w-6 h-6" />
        QUEST_LOG
      </h2>

      <div className="grid grid-cols-1 gap-4 pb-4">
        {questsData.quests.map((quest, index) => (
          <motion.div
            key={quest.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`
              relative p-4 border-l-4 font-hud bg-black/40 hover:bg-white/5 transition-colors group
              ${quest.completed ? 'border-primary' : quest.status === 'in-progress' ? 'border-yellow-400/60' : 'border-muted'}
            `}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-2">
              <h3 className="text-xl font-bold tracking-wider text-primary group-hover:text-white transition-colors">
                {quest.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={quest.status} completed={quest.completed} />
                {quest.online !== undefined && (
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 border ${quest.online ? 'text-green-400 border-green-500/40 bg-green-500/10' : 'text-red-400 border-red-500/40 bg-red-500/10'}`}>
                    {quest.online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {quest.online ? "ONLINE" : "OFFLINE"}
                  </span>
                )}
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
                {quest.links?.demo && quest.links?.demoUrl && (
                  <a
                    href={quest.links.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:text-primary transition-colors uppercase font-bold tracking-wide"
                  >
                    <PlayCircle className="w-4 h-4" /> Demo
                  </a>
                )}
                {quest.links?.view && quest.links?.viewUrl && (
                  <a
                    href={quest.links.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:text-secondary transition-colors uppercase font-bold tracking-wide"
                  >
                    <ExternalLink className="w-4 h-4" /> View Project
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status, completed }: { status: string; completed?: boolean }) {
  if (completed || status === "complete") {
    return (
      <span className="text-primary flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 border border-primary/30">
        <CheckCircle2 className="w-3 h-3" /> COMPLETED
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="text-yellow-300 flex items-center gap-1 text-xs px-2 py-1 bg-yellow-500/10 border border-yellow-500/30">
        <Clock className="w-3 h-3" /> IN PROGRESS
      </span>
    );
  }

  return (
    <span className="text-muted-foreground flex items-center gap-1 text-xs px-2 py-1 bg-white/5 border border-white/10">
      <Lock className="w-3 h-3" /> LOCKED
    </span>
  );
}
