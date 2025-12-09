import { motion } from "framer-motion";

const SKILLS = [
  { name: "React / Next.js", level: 95, color: "bg-primary" },
  { name: "TypeScript", level: 90, color: "bg-primary" },
  { name: "Tailwind CSS", level: 98, color: "bg-secondary" },
  { name: "Node.js", level: 85, color: "bg-accent" },
  { name: "Database Design", level: 80, color: "bg-accent" },
  { name: "UI/UX Design", level: 75, color: "bg-secondary" },
];

export function SkillTree() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h2 className="text-2xl font-pixel text-accent mb-8">SKILL_TREE_MATRIX</h2>

      <div className="grid gap-8">
        {SKILLS.map((skill, index) => (
          <div key={skill.name} className="relative">
            <div className="flex justify-between mb-2 font-hud text-lg">
              <span className="text-white">{skill.name}</span>
              <span className="text-primary">{skill.level}%</span>
            </div>
            <div className="h-6 w-full bg-black border border-white/20 p-1 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                className={`h-full ${skill.color} relative group`}
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-white opacity-50" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              
              {/* Grid lines overlay */}
              <div className="absolute inset-0 grid grid-cols-10 pointer-events-none">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border-r border-black/30 h-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-4 border border-dashed border-muted-foreground/50 font-terminal text-muted-foreground">
        <p>&gt; ADDITIONAL PERKS DETECTED:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Git Version Control Mastery</li>
          <li>Agile Methodology Sync</li>
          <li>Fast Learner Buff (+50% XP Gain)</li>
          <li>Coffee Consumption Resistance (+20 Stamina)</li>
        </ul>
      </div>
    </div>
  );
}
