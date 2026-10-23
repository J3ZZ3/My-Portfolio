import { motion } from "framer-motion";
import skillData from "@shared/data/skills.json";

const panelAccent = ["border-primary/40", "border-secondary/40", "border-accent/40", "border-yellow-400/40"];
const labelAccent = ["text-primary", "text-secondary", "text-accent", "text-yellow-400"];

export function SkillTree() {
  return (
    <div className="h-full w-full p-4 md:p-6 overflow-y-auto flex flex-col min-h-0">
      <h2 className="text-sm sm:text-xl md:text-2xl leading-tight font-pixel text-accent mb-6 md:mb-8 break-words">
        SKILL_MATRIX
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 md:flex-1 md:min-h-0">
        {skillData.groups.map((group, index) => (
          <motion.section
            key={group.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className={`border-2 ${panelAccent[index % panelAccent.length]} bg-black/40 p-4 min-w-0 md:min-h-0`}
          >
            <h3 className={`font-pixel text-xs md:text-sm mb-4 break-words leading-relaxed ${labelAccent[index % labelAccent.length]}`}>
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <span
                  key={item}
                  className="bg-muted/10 border border-muted px-2 py-1 font-terminal text-base leading-relaxed text-white/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
