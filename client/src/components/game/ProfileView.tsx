import { motion } from "framer-motion";
import { Shield, Zap, Brain, Terminal, MapPin, GraduationCap, Mail, Github } from "lucide-react";
import profileData from "@shared/data/profile.json";

const traitStyles = {
  focus: {
    Icon: Brain,
    box: "bg-primary/5 p-4 border border-primary/20",
    label: "text-primary",
  },
  style: {
    Icon: Zap,
    box: "bg-secondary/5 p-4 border border-secondary/20",
    label: "text-secondary",
  },
  mindset: {
    Icon: Shield,
    box: "bg-accent/5 p-4 border border-accent/20",
    label: "text-accent",
  },
  tactics: {
    Icon: Terminal,
    box: "bg-muted/30 p-4 border border-muted",
    label: "text-muted-foreground",
  },
} as const;

const traitIds = ["focus", "style", "mindset", "tactics"] as const;

const linkClass =
  "inline-flex items-center gap-2 min-h-11 px-3 py-2 border border-primary/50 text-primary text-sm break-all hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function isTraitId(id: string): id is (typeof traitIds)[number] {
  return (traitIds as readonly string[]).includes(id);
}

export function ProfileView() {
  const { display, professional } = profileData;

  return (
    <div className="h-full w-full p-4 md:p-6 overflow-y-auto font-terminal text-lg leading-relaxed">
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full md:w-1/3 flex flex-col items-start"
        >
          <div className="relative w-full max-w-48 max-h-48 aspect-square mb-4 border-4 border-primary p-1 bg-black/50">
            <img
              src="/images/profile-avatar.png"
              alt="Jesse Mashoana"
              className="w-full h-full object-cover pixelated"
            />
            <div className="absolute top-0 left-0 w-full h-full bg-primary/10 pointer-events-none" />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-primary text-black px-2 py-1 font-pixel text-xs whitespace-nowrap">
              {display.avatarLabel}
            </div>
          </div>

          <div className="w-full mt-4 space-y-2 font-hud">
            <div className="flex items-center gap-3 text-primary">
              <span className="min-w-[32px]">HP</span>
              <div className="w-32 h-4 border border-primary p-0.5">
                <div className="h-full bg-primary" style={{ width: `${display.stats.hp}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-secondary">
              <span className="min-w-[32px]">MP</span>
              <div className="w-32 h-4 border border-secondary p-0.5">
                <div className="h-full bg-secondary" style={{ width: `${display.stats.mp}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-3 text-accent">
              <span className="min-w-[32px]">XP</span>
              <div className="w-32 h-4 border border-accent p-0.5">
                <div className="h-full bg-accent" style={{ width: `${display.stats.xp}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 w-full space-y-2 font-hud text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>LOC: {display.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="w-4 h-4 text-secondary shrink-0" />
              <span>GUILD: {display.guild}</span>
            </div>
          </div>

          <div className="mt-6 w-full">
            <h3 className="font-pixel text-xs text-primary mb-3">CONTACT_UPLINK</h3>
            <div className="flex flex-col items-start gap-2">
              <a href={`mailto:${professional.email}`} className={linkClass}>
                <Mail className="w-4 h-4 shrink-0" />
                {professional.email}
              </a>
              <a
                href={professional.github.url}
                target="_blank"
                rel="noreferrer"
                className={linkClass}
              >
                <Github className="w-4 h-4 shrink-0" />
                {professional.github.username}
              </a>
            </div>
          </div>
        </motion.div>

        <div className="w-full md:w-2/3 space-y-6 min-w-0">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl md:text-2xl font-pixel text-primary mb-4 border-b-2 border-primary pb-2 break-words">
              PLAYER_BIO
            </h2>
            <div className="text-muted-foreground leading-relaxed mb-4 space-y-2">
              <p>
                {display.systemLines.map((line) => (
                  <span key={line}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
              {display.bio.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index === 0
                      ? "pl-4 border-l-2 border-primary/30"
                      : "pl-4 border-l-2 border-secondary/30 mt-2"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {display.traits.map((trait) => {
              if (!isTraitId(trait.id)) return null;
              const style = traitStyles[trait.id];
              const Icon = style.Icon;
              return (
                <div key={trait.id} className={style.box}>
                  <div className={`flex items-center gap-2 mb-2 font-pixel text-xs ${style.label}`}>
                    <Icon className="w-4 h-4" />
                    <span>{trait.label}</span>
                  </div>
                  <p className="text-sm">{trait.text}</p>
                </div>
              );
            })}
          </motion.div>

          <section>
            <h2 className="text-sm md:text-xl font-pixel text-secondary mb-4 border-b-2 border-secondary pb-2 break-words">
              EXPERIENCE_LOG
            </h2>
            <div className="space-y-4">
              {professional.experience.map((role) => (
                <div key={`${role.organization}-${role.placement}`} className="border border-secondary/30 bg-secondary/5 p-4">
                  <p className="text-white font-hud text-xl">{role.organization}</p>
                  <p className="text-secondary">PLACED AT: {role.placement}</p>
                  <p className="text-muted-foreground text-base">
                    {role.start} – {role.end}
                  </p>
                  <ul className="mt-3 space-y-1 text-base text-muted-foreground">
                    {role.areas.map((area) => (
                      <li key={area} className="pl-4 border-l-2 border-secondary/30">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm md:text-xl font-pixel text-accent mb-4 border-b-2 border-accent pb-2 break-words">
              TRAINING_LOG
            </h2>
            <div className="space-y-4">
              {professional.education.map((item) => (
                <div key={`${item.organization}-${item.program}`} className="border border-accent/30 bg-accent/5 p-4">
                  <p className="text-white font-hud text-xl">{item.organization}</p>
                  <p className="text-accent">{item.program}</p>
                  <p className="text-muted-foreground text-base uppercase">
                    {item.status} {item.date}
                  </p>
                  {"includes" in item && item.includes ? (
                    <p className="mt-2 text-base text-muted-foreground">
                      Includes {item.includes.join(", ")}.
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
