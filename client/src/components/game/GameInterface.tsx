import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Sword, Zap, MessageSquare, Power, Gamepad2 } from "lucide-react";
import menuData from "@/data/menu.json";
import { ProfileView } from "./ProfileView";
import { QuestLog } from "./QuestLog";
import { SkillTree } from "./SkillTree";
import { CommsView } from "./CommsView";
import { ArcadeView } from "./ArcadeView";
import { audio } from "@/lib/audio";

interface GameInterfaceProps {
  onLogout: () => void;
  musicMuted: boolean;
  musicVolume: number;
  onToggleMute: () => void;
  onVolumeChange: (value: number) => void;
}

type TabId = "profile" | "quests" | "skills" | "comms" | "arcade";

const iconMap = { User, Sword, Zap, Gamepad2, MessageSquare } as const;

export function GameInterface({
  onLogout,
  musicMuted,
  musicVolume,
  onToggleMute,
  onVolumeChange,
}: GameInterfaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const menuItems = menuData.items;

  useEffect(() => {
    audio.setVolume(musicVolume);
    audio.setMuted(musicMuted);
  }, [musicMuted, musicVolume]);

  const handleTabChange = (id: TabId) => {
    if (id !== activeTab) {
      audio.playClick();
      setActiveTab(id);
    }
  };

  const handleLogout = () => {
    audio.playBack();
    onLogout();
  };

  const navButton = (item: (typeof menuItems)[number], compact: boolean) => {
    const Icon = iconMap[item.icon as keyof typeof iconMap] ?? User;
    const selected = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        aria-label={item.label}
        aria-current={selected ? "page" : undefined}
        onClick={() => handleTabChange(item.id as TabId)}
        onMouseEnter={() => audio.playHover()}
        className={
          compact
            ? `min-h-11 min-w-11 flex-1 flex flex-col items-center justify-center gap-1 ${selected ? "bg-primary/20 text-white" : "text-muted-foreground"}`
            : `relative min-h-11 px-4 py-3 flex items-center gap-4 transition-all w-full text-left ${selected ? "bg-primary/20 border-r-4 border-primary" : "hover:bg-white/5"}`
        }
      >
        <Icon className={`w-6 h-6 ${item.color}`} />
        {compact ? (
          <span className="font-hud text-[10px] leading-none">{item.label}</span>
        ) : (
          <span className={`font-hud text-xl tracking-wider ${selected ? "text-white" : "text-muted-foreground"}`}>
            {item.label}
          </span>
        )}
        {selected && !compact && (
          <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}
      </button>
    );
  };

  const audioControls = (compact: boolean) => (
    <div className={compact ? "flex items-center gap-2 px-2 pb-2" : "px-3 pb-4"}>
      <div className={`flex items-center gap-2 bg-black/70 border border-primary/40 px-2 py-1 ${compact ? "w-full" : "rounded"}`}>
        <button
          type="button"
          onClick={onToggleMute}
          aria-pressed={musicMuted}
          className="min-h-11 min-w-11 px-2 border border-primary/50 text-primary hover:bg-primary/10 text-xs font-mono"
        >
          {musicMuted ? "UNMUTE" : "MUTE"}
        </button>
        <label className="flex items-center gap-2 text-xs font-mono text-primary flex-1 min-h-11">
          VOL
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={musicVolume}
            aria-label="Volume"
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="h-11 accent-primary w-full"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh w-full max-w-full flex-col md:flex-row p-2 md:p-6 gap-2 md:gap-4 overflow-hidden">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-2 border-primary/30 bg-black/80 backdrop-blur-sm">
        <div className="p-4 border-b-2 border-primary/30 text-center">
          <h1 className="font-pixel text-xl text-primary text-glow">MENU</h1>
        </div>
        <nav aria-label="Portfolio" className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
          {menuItems.map((item) => navButton(item, false))}
        </nav>
        {audioControls(false)}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          onMouseEnter={() => audio.playHover()}
          className="min-h-11 p-4 border-t-2 border-red-500/30 hover:bg-red-500/20 text-red-500 flex items-center justify-center gap-2"
        >
          <Power className="w-6 h-6" />
          <span className="font-pixel text-xs">LOGOUT</span>
        </button>
      </aside>

      <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2">
        <div className="min-h-14 border-2 border-primary/30 bg-black/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-3 h-3 shrink-0 bg-red-500 rounded-full motion-safe:animate-pulse" />
            <span className="font-hud text-sm sm:text-base text-primary tracking-widest">SYSTEM_READY</span>
          </div>
          <div className="font-terminal text-sm text-muted-foreground break-words">
            USER: GUEST // LOC: {activeTab.toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-h-0 border-2 border-primary/30 bg-black/60 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary pointer-events-none" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary pointer-events-none" />

          <div className="h-full min-h-0">
            {activeTab === "profile" && <ProfileView />}
            {activeTab === "quests" && <QuestLog />}
            {activeTab === "skills" && <SkillTree />}
            {activeTab === "arcade" && <ArcadeView />}
            {activeTab === "comms" && <CommsView />}
          </div>
        </div>
      </div>

      <nav aria-label="Portfolio" className="md:hidden shrink-0 border-2 border-primary/30 bg-black/90">
        <div className="flex">{menuItems.map((item) => navButton(item, true))}</div>
        <div className="flex items-center">
          <div className="flex-1">{audioControls(true)}</div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="min-h-11 min-w-11 mr-2 border border-red-500/40 text-red-500 flex items-center justify-center"
          >
            <Power className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}
