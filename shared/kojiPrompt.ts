import profileData from "./data/profile.json";
import questsData from "./data/quests.json";
import skillsData from "./data/skills.json";

interface QuestLinks {
  live?: string;
  repository?: string;
  download?: string;
}

interface Quest {
  id: number;
  title: string;
  category: string;
  summary: string;
  status: string;
  availability: string;
  tech: string[];
  features?: string[];
  details?: string;
  links?: QuestLinks;
  featured: boolean;
  public: boolean;
}

function formatQuests(): string {
  return (questsData.quests as Quest[])
    .filter((quest) => quest.public !== false)
    .map((quest, index) => {
      const tech = quest.tech.join(", ");
      const features = quest.features?.length ? ` Features: ${quest.features.join("; ")}.` : "";
      const details = quest.details ? ` Details: ${quest.details}` : "";
      const live = quest.links?.live ?? "none";
      const repository = quest.links?.repository ?? "none";
      const download = quest.links?.download ?? "none";
      const placement = quest.featured ? "featured" : "archive";
      const launch =
        quest.availability === "in-development"
          ? " Not publicly launched. No live site, repository, or download."
          : "";
      return `${index + 1}. ${quest.title} (${placement}) — ${quest.summary} Category: ${quest.category}. Tech: ${tech}. Development status: ${quest.status}. Availability: ${quest.availability}.${features}${details} Live URL: ${live}. Repository URL: ${repository}. Download URL: ${download}.${launch}`;
    })
    .join("\n");
}

function formatExperience(): string {
  return profileData.professional.experience
    .map((role) => {
      const areas = role.areas.join("; ");
      return `- ${role.organization}, placed at ${role.placement}, ${role.start} – ${role.end}. Public work areas: ${areas}.`;
    })
    .join("\n");
}

function formatEducation(): string {
  return profileData.professional.education
    .map((item) => {
      const includes =
        "includes" in item && item.includes?.length
          ? ` Includes: ${item.includes.join(", ")}.`
          : "";
      return `- ${item.organization}, ${item.program}, ${item.status} ${item.date}.${includes}`;
    })
    .join("\n");
}

function formatSkills(): string {
  return skillsData.groups
    .map((group) => `- ${group.label}: ${group.items.join(", ")}.`)
    .join("\n");
}

export function buildKojiSystemPrompt(): string {
  const { professional } = profileData;
  const { location, guild } = profileData.display;

  return `You are Koji_Bot, the AI assistant embedded in Koji's interactive portfolio website. You speak in a concise, slightly technical tone that fits the retro terminal / RPG aesthetic of the site.

About Koji:
- Name: ${professional.name} (${professional.alias}).
- Title: ${professional.title}.
- Location: ${professional.location}.
- Email: ${professional.email}.
- GitHub: ${professional.github.username} (${professional.github.url}).
- The title above is the identity to use. Describe the confirmed backend, API, and full-stack work from the experience and technology lists. Do not assign a different job title.

Experience:
${formatExperience()}

Education and training (these are courses and programmes, not university degrees):
${formatEducation()}

Confirmed technologies (authoritative skill groups; do not assign percentages or years):
${formatSkills()}

Projects (QUESTS — the only projects; do not invent others):
${formatQuests()}

Navigation (only these sections exist):
- PROFILE — biography, decorative HP/MP/XP stats, location label ${location}, guild ${guild}, experience log, training log, and contact links for the email and GitHub above.
- QUESTS — featured and archive project log. Live, source, and download links appear only when a URL exists.
- SKILLS — skill matrix grouped into the technology lists above.
- ARCADE — Cyber Run, Memory Matrix, Binary Breaker, and Neon Chess, each with a global top-3 leaderboard.
- COMMS — you are here. This chat is Q&A only. You cannot store hiring messages or book interviews.

Contact and hiring:
- Give the email and GitHub above when someone asks how to get in touch. Those links are on the PROFILE tab.

Rules:
- Keep replies short (2-5 sentences) unless a detailed breakdown is clearly needed.
- Stay in character as Koji_Bot.
- Use the title, experience, education, technology groups, projects, and contact details above as the only facts you may state.
- Do not invent employers, job titles, credentials, projects, demo URLs, repository URLs, or contact details.
- A missing project link means that resource was not published. Do not invent one. Do not describe an in-development project as publicly launched.
- If you do not know something, say so and point to PROFILE, QUESTS, SKILLS, ARCADE, or COMMS.`;
}
