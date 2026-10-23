import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sword,
  ExternalLink,
  Download,
  Globe,
  CheckCircle2,
  Clock,
  ChevronDown,
  Store,
  Dumbbell,
  ListChecks,
  Mic,
  CloudSun,
} from "lucide-react";
import questsData from "@shared/data/quests.json";

type Quest = (typeof questsData.quests)[number];

const categoryIcons = {
  "Full-Stack / E-commerce": Store,
  "Mobile Application / Fitness": Dumbbell,
  "Mobile Application": ListChecks,
  "Mobile Application / Audio": Mic,
  "Web Application": CloudSun,
} as const;

const linkClass =
  "inline-flex items-center gap-2 min-h-11 px-3 py-2 border border-primary/50 text-primary text-sm uppercase tracking-wide hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function QuestLog() {
  const quests = questsData.quests.filter((quest) => quest.public !== false);
  const featured = quests.filter((quest) => quest.featured);
  const archive = quests.filter((quest) => !quest.featured);

  return (
    <div className="h-full w-full p-4 md:p-6 overflow-y-auto">
      <h2 className="text-sm sm:text-xl md:text-2xl font-pixel text-secondary mb-6 flex items-center gap-3 break-words">
        <Sword className="w-6 h-6 shrink-0" />
        QUEST_LOG
      </h2>

      <section className="mb-8">
        <h3 className="font-pixel text-sm text-primary mb-4">FEATURED_QUESTS</h3>
        <div className="grid grid-cols-1 gap-4">
          {featured.map((quest, index) => (
            <QuestCard key={quest.id} quest={quest} index={index} />
          ))}
        </div>
      </section>

      {archive.length > 0 && (
        <details className="border border-white/15 bg-black/30">
          <summary className="cursor-pointer list-none px-4 py-3 font-pixel text-sm text-muted-foreground hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            PROJECT_ARCHIVE ({archive.length})
          </summary>
          <div className="grid grid-cols-1 gap-4 p-4 pt-0">
            {archive.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function QuestCard({ quest, index }: { quest: Quest; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = categoryIcons[quest.category as keyof typeof categoryIcons] ?? Sword;
  const complete = quest.status === "complete";
  const features = "features" in quest ? quest.features : undefined;
  const details = "details" in quest ? quest.details : undefined;
  const canInspect = Boolean(features?.length || details);
  const links = "links" in quest ? quest.links : undefined;

  return (
    <motion.article
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.08 }}
      className={`relative p-4 border-l-4 font-hud bg-black/40 hover:bg-white/5 transition-colors ${
        complete ? "border-primary" : "border-yellow-400/70"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <Icon className="w-5 h-5 mt-1 shrink-0 text-secondary" />
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold tracking-wide text-primary break-words">
              {quest.title}
            </h3>
            <p className="text-sm uppercase tracking-wider text-muted-foreground leading-relaxed">{quest.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={quest.status} />
          <AvailabilityBadge availability={quest.availability} />
        </div>
      </div>

      <p className="text-muted-foreground font-terminal text-lg mb-4 leading-relaxed">
        {quest.summary}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {quest.tech.map((item) => (
          <span key={item} className="px-2 py-1 text-sm border border-accent/30 text-accent bg-accent/5 font-mono">
            {item}
          </span>
        ))}
      </div>

      {canInspect && (
        <div className="mb-4">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-2 min-h-11 px-3 text-sm uppercase tracking-wide text-white border border-white/20 hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Inspect
            <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="mt-3 space-y-3 border border-white/10 bg-black/40 p-3">
              {features && features.length > 0 && (
                <ul className="space-y-1 text-muted-foreground font-terminal text-lg leading-relaxed">
                  {features.map((feature) => (
                    <li key={feature} className="pl-3 border-l-2 border-accent/40">
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              {details && (
                <p className="font-terminal text-lg text-white/80 leading-relaxed">{details}</p>
              )}
            </div>
          )}
        </div>
      )}

      {links && (
        <div className="flex flex-wrap gap-2">
          {"live" in links && links.live && (
            <a href={links.live} target="_blank" rel="noreferrer" className={linkClass}>
              <Globe className="w-4 h-4" />
              Live site
            </a>
          )}
          {"repository" in links && links.repository && (
            <a href={links.repository} target="_blank" rel="noreferrer" className={linkClass}>
              <ExternalLink className="w-4 h-4" />
              Source
            </a>
          )}
          {"download" in links && links.download && (
            <a href={links.download} target="_blank" rel="noreferrer" className={linkClass}>
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
        </div>
      )}
    </motion.article>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") {
    return (
      <span className="text-primary flex items-center gap-1 text-sm px-2 py-1 bg-primary/10 border border-primary/30">
        <CheckCircle2 className="w-3 h-3" />
        COMPLETED
      </span>
    );
  }

  return (
    <span className="text-yellow-300 flex items-center gap-1 text-sm px-2 py-1 bg-yellow-500/10 border border-yellow-500/30">
      <Clock className="w-3 h-3" />
      IN DEVELOPMENT
    </span>
  );
}

function AvailabilityBadge({ availability }: { availability: string }) {
  if (availability === "live") {
    return (
      <span className="text-accent flex items-center gap-1 text-sm px-2 py-1 border border-accent/40 bg-accent/10">
        LIVE_SITE
      </span>
    );
  }

  if (availability === "download") {
    return (
      <span className="text-secondary flex items-center gap-1 text-sm px-2 py-1 border border-secondary/40 bg-secondary/10">
        DOWNLOAD
      </span>
    );
  }

  return (
    <span className="text-yellow-300 flex items-center gap-1 text-sm px-2 py-1 border border-yellow-500/40 bg-yellow-500/10">
      IN_DEVELOPMENT
    </span>
  );
}
