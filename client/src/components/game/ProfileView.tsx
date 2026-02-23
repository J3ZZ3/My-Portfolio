import { motion } from "framer-motion";
import { Shield, Zap, Brain, Terminal, MapPin, GraduationCap } from "lucide-react";
import avatarImage from "@assets/generated_images/pixel_art_cyberpunk_avatar.png";
import profileData from "@/data/profile.json";

export function ProfileView() {
  return (
    <div className="h-full w-full p-6 overflow-y-auto font-terminal text-lg">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Avatar Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full md:w-1/3 flex flex-col items-start"
        >
          <div className="relative w-48 h-48 mb-4 border-4 border-primary p-1 bg-black/50">
            <img 
              src={avatarImage} 
              alt="Player Avatar" 
              className="w-full h-full object-cover pixelated"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-primary/10 pointer-events-none" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-black px-2 py-1 font-pixel text-xs whitespace-nowrap">
              {profileData.avatarLabel}
            </div>
          </div>
          
          <div className="w-full mt-4 space-y-2 font-hud">
            <div className="flex items-center gap-3 text-primary">
              <span className="min-w-[32px]">HP</span>
              <div className="w-32 h-4 border border-primary p-0.5">
                <div className="h-full bg-primary" style={{ width: `${profileData.stats.hp}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-secondary">
              <span className="min-w-[32px]">MP</span>
              <div className="w-32 h-4 border border-secondary p-0.5">
                <div className="h-full bg-secondary" style={{ width: `${profileData.stats.mp}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-accent">
              <span className="min-w-[32px]">XP</span>
              <div className="w-32 h-4 border border-accent p-0.5">
                <div className="h-full bg-accent" style={{ width: `${profileData.stats.xp}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 font-hud text-sm">
             <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>LOC: {profileData.location}</span>
             </div>
             <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="w-4 h-4 text-secondary" />
                <span>GUILD: {profileData.guild}</span>
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
            <div className="text-muted-foreground leading-relaxed mb-4 space-y-2">
              <p>
                &gt; SYSTEM MSG: WELCOME TO MY PORTFOLIO.<br/>
                &gt; CLASS: JUNIOR DEVELOPER (WEB & MOBILE).<br/>
              </p>
              <p className="pl-4 border-l-2 border-primary/30">
                Dedicated and results-driven Junior Developer with a passion for crafting functional, user-friendly, and visually engaging applications. My goal is to create innovative solutions that address real-world challenges, combining creativity with technical expertise.
              </p>
              <p className="pl-4 border-l-2 border-secondary/30 mt-2">
                I thrive in dynamic environments where I can collaborate with others, tackle complex problems, and continuously expand my skill set. Committed to excellence and a growth mindset.
              </p>
            </div>
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
                <span>FOCUS</span>
              </div>
              <p className="text-sm">Innovative Solutions & Real-world Challenges</p>
            </div>
            <div className="bg-secondary/5 p-4 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2 text-secondary font-pixel text-xs">
                <Zap className="w-4 h-4" />
                <span>STYLE</span>
              </div>
              <p className="text-sm">Functional, User-Friendly, Visually Engaging</p>
            </div>
            <div className="bg-accent/5 p-4 border border-accent/20">
              <div className="flex items-center gap-2 mb-2 text-accent font-pixel text-xs">
                <Shield className="w-4 h-4" />
                <span>MINDSET</span>
              </div>
              <p className="text-sm">Growth Mindset & Commitment to Excellence</p>
            </div>
            <div className="bg-muted/30 p-4 border border-muted">
              <div className="flex items-center gap-2 mb-2 text-muted-foreground font-pixel text-xs">
                <Terminal className="w-4 h-4" />
                <span>TACTICS</span>
              </div>
              <p className="text-sm">Collaboration & Complex Problem Solving</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
