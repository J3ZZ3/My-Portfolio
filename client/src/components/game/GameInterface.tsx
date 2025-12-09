import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Sword, Zap, MessageSquare, Power, Gamepad2 } from "lucide-react";
import { ProfileView } from "./ProfileView";
import { QuestLog } from "./QuestLog";
import { SkillTree } from "./SkillTree";
import { CommsView } from "./CommsView";
import { MiniGame } from "./MiniGame";
import { ArcadeView } from "./ArcadeView";
import { audio } from "@/lib/audio";

interface GameInterfaceProps {
  onLogout: () => void;
}

export function GameInterface({ onLogout }: GameInterfaceProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "quests" | "skills" | "comms" | "arcade">("profile");

  const menuItems = [
    { id: "profile", label: "PROFILE", icon: User, color: "text-primary" },
    { id: "quests", label: "QUESTS", icon: Sword, color: "text-secondary" },
    { id: "skills", label: "SKILLS", icon: Zap, color: "text-accent" },
    { id: "arcade", label: "ARCADE", icon: Gamepad2, color: "text-yellow-400" },
    { id: "comms", label: "COMMS", icon: MessageSquare, color: "text-white" },
  ] as const;

  const handleTabChange = (id: typeof activeTab) => {
    if (id !== activeTab) {
      audio.playClick();
      setActiveTab(id);
    }
  };

  const handleLogout = () => {
    audio.playBack();
    onLogout();
  };

  return (
    <div className="flex h-screen w-screen p-4 md:p-8 gap-4 overflow-hidden relative z-10">
      {/* Left Sidebar - HUD Menu */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-20 md:w-64 flex flex-col border-2 border-primary/30 bg-black/80 backdrop-blur-sm"
      >
        <div className="p-4 border-b-2 border-primary/30 text-center">
          <h1 className="hidden md:block font-pixel text-xl text-primary text-glow">MENU</h1>
          <h1 className="md:hidden font-pixel text-xl text-primary">M</h1>
        </div>
        
        <nav className="flex-1 py-8 flex flex-col gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as any)}
              onMouseEnter={() => audio.playHover()}
              className={`
                relative px-4 py-3 flex items-center gap-4 transition-all w-full text-left
                ${activeTab === item.id ? 'bg-primary/20 border-r-4 border-primary' : 'hover:bg-white/5'}
              `}
            >
              <item.icon className={`w-6 h-6 ${item.color}`} />
              <span className={`hidden md:block font-hud text-xl tracking-wider ${activeTab === item.id ? 'text-white' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          onMouseEnter={() => audio.playHover()}
          className="p-4 border-t-2 border-red-500/30 hover:bg-red-500/20 text-red-500 flex items-center justify-center gap-2 transition-colors group"
        >
          <Power className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="hidden md:block font-pixel text-xs">LOGOUT</span>
        </button>
      </motion.div>

      {/* Main Content Area - CRT Screen */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Top Header Bar */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="h-16 border-2 border-primary/30 bg-black/80 backdrop-blur-sm flex items-center justify-between px-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="font-hud text-primary tracking-widest">SYSTEM_READY</span>
          </div>
          <div className="font-terminal text-muted-foreground">
            USER: GUEST // LOC: {activeTab.toUpperCase()}
          </div>
        </motion.div>

        {/* Content Viewport */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 border-2 border-primary/30 bg-black/60 relative overflow-hidden backdrop-blur-md"
        >
          {/* Corner Decors */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === "profile" && <ProfileView />}
              {activeTab === "quests" && <QuestLog />}
              {activeTab === "skills" && <SkillTree />}
              {activeTab === "arcade" && <ArcadeView />}
              {activeTab === "comms" && <CommsView />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
