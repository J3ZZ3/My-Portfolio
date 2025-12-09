import { motion } from "framer-motion";
import { Wrench, Code2, Database, Smartphone } from "lucide-react";

const SKILLS = [
  { name: "HTML", level: 75, desc: "Used in multiple projects", color: "bg-primary" },
  { name: "CSS", level: 90, desc: "Responsive layouts", color: "bg-secondary" },
  { name: "React.js", level: 80, desc: "State management", color: "bg-accent" },
  { name: "JavaScript", level: 70, desc: "Async programming", color: "bg-primary" },
  { name: "React Native", level: 75, desc: "Mobile app development", color: "bg-secondary" },
];

const TOOLS = [
  "JavaScript", "HTML5", "CSS3", "React.js", 
  "Git", "GitHub", "Firebase", "MongoDB", 
  "Supabase", "React Native (Expo)", "Postman"
];

export function SkillTree() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto">
      <h2 className="text-2xl font-pixel text-accent mb-8">SKILL_MATRIX</h2>

      <div className="grid gap-6 mb-12">
        {SKILLS.map((skill, index) => (
          <div key={skill.name} className="relative">
            <div className="flex justify-between items-end mb-2 font-hud">
              <div>
                <span className="text-white text-lg block">{skill.name}</span>
                <span className="text-muted-foreground text-xs font-terminal uppercase">{skill.desc}</span>
              </div>
              <span className="text-primary font-bold">{skill.level}%</span>
            </div>
            <div className="h-4 w-full bg-black border border-white/20 p-0.5 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${skill.level}%` }}
                transition={{ duration: 1, delay: 0.2 + (index * 0.1), ease: "easeOut" }}
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

      <div className="mt-8">
        <h3 className="text-xl font-pixel text-muted-foreground mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          INVENTORY / TOOLS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TOOLS.map((tool, i) => (
            <motion.div 
              key={tool}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + (i * 0.05) }}
              className="bg-muted/10 border border-muted p-2 flex items-center gap-2 hover:bg-white/5 hover:border-white/30 transition-colors"
            >
              <div className="w-2 h-2 bg-primary rotate-45" />
              <span className="font-terminal text-sm text-white/80">{tool}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
