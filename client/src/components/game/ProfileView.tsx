import { motion } from "framer-motion";
import { User, Shield, Zap, Brain, Terminal } from "lucide-react";
import avatarImage from "@assets/generated_images/pixel_art_cyberpunk_avatar.png";

export function ProfileView() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto font-terminal text-lg">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full md:w-1/3 flex flex-col items-center"
        >
          <div className="relative w-48 h-48 mb-4 border-4 border-primary p-1 bg-black/50">
            <img 
              src={avatarImage} 
              alt="Player Avatar" 
              className="w-full h-full object-cover pixelated"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-primary/10 pointer-events-none" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-black px-2 py-1 font-pixel text-xs whitespace-nowrap">
              LVL. 25 DEV
            </div>
          </div>
          
          <div className="w-full mt-4 space-y-2 font-hud">
            <div className="flex justify-between text-primary">
              <span>HP</span>
              <div className="w-32 h-4 border border-primary p-0.5">
                <div className="h-full bg-primary w-[80%] animate-pulse" />
              </div>
            </div>
            <div className="flex justify-between text-secondary">
              <span>MP</span>
              <div className="w-32 h-4 border border-secondary p-0.5">
                <div className="h-full bg-secondary w-[100%]" />
              </div>
            </div>
            <div className="flex justify-between text-accent">
              <span>XP</span>
              <div className="w-32 h-4 border border-accent p-0.5">
                <div className="h-full bg-accent w-[65%]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="w-full md:w-2/3 space-y-6">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-pixel text-primary mb-4 border-b-2 border-primary pb-2">
              PLAYER_BIO
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              &gt; INITIALIZING BIO_SEQUENCE...<br/>
              &gt; FULL STACK OPERATIVE SPECIALIZED IN REACT SYSTEMS.<br/>
              &gt; MISSION: BUILD ENGAGING DIGITAL EXPERIENCES.<br/>
              &gt; STATUS: ONLINE AND READY FOR DEPLOYMENT.
            </p>
          </motion.div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="bg-primary/5 p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2 text-primary font-pixel text-xs">
                <Brain className="w-4 h-4" />
                <span>INTELLIGENCE</span>
              </div>
              <p className="text-sm">Problem Solving, Architecture, Logic</p>
            </div>
            <div className="bg-secondary/5 p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2 text-secondary font-pixel text-xs">
                <Zap className="w-4 h-4" />
                <span>SPEED</span>
              </div>
              <p className="text-sm">Rapid Prototyping, Optimization</p>
            </div>
            <div className="bg-accent/5 p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2 text-accent font-pixel text-xs">
                <Shield className="w-4 h-4" />
                <span>DEFENSE</span>
              </div>
              <p className="text-sm">Type Safety, Error Handling, Testing</p>
            </div>
            <div className="bg-muted/30 p-4 border border-muted">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground font-pixel text-xs">
                <Terminal className="w-4 h-4" />
                <span>CHARISMA</span>
              </div>
              <p className="text-sm">Documentation, Team Collaboration</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
