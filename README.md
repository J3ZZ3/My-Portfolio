# REWORK - Interactive Portfolio

A retro-futuristic, game-inspired interactive portfolio built with React, TypeScript, and Vite. Experience a cyberpunk-themed interface where projects become quests, skills become a matrix, and your journey is told through an immersive gaming experience.

**Live Demo:** [loganjesse.vercel.app](https://loganjesse.vercel.app) (or your custom domain)

## 🎮 Features

- **Interactive Game Interface** - Navigate through your portfolio like a retro game
- **Quest Log** - Projects displayed as completed quests with live/demo links
- **Skill Matrix** - Visual representation of your technical skills with progress bars
- **Arcade System** - Playable mini-games with global top-3 leaderboards
- **Comms System** - Koji_Bot AI assistant (Groq) synced to quests.json
- **Dynamic Backgrounds** - Rotating video backgrounds with manual controls
- **Background Music** - Immersive arcade-style audio with volume controls
- **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- **Data-Driven** - All content managed through JSON files for easy updates

## 🛠️ Technologies Used

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible component primitives
- **Wouter** - Lightweight routing
- **Express** - Backend server (for production builds)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/J3ZZ3/My-Portfolio.git
cd My-Portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── game/          # Game interface components
│   │   ├── data/              # Menu and arcade shell config
│   │   ├── pages/             # Page components
│   │   └── lib/               # Utilities
│   └── public/                # Static assets (videos, images)
├── server/                    # Express server
└── shared/                    # Canonical portfolio data and Koji prompt
```

## 📝 Data Management

Portfolio facts live in `shared/data/` so the React UI and Koji_Bot read the same files:

- `profile.json` - On-screen profile copy and the professional record
- `skills.json` - Four skill groups and confirmed technologies
- `quests.json` - Projects with links and status

Shell config stays in `client/src/data/`:

- `menu.json` - Navigation menu items
- `arcade.json` - Arcade game configurations

Edit the shared JSON files to update portfolio content. Redeploy so the chatbot prompt picks up the same data.

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`

### Environment Variables

Copy `.env.example` to `.env` for local development:

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Powers Koji_Bot in the COMMS tab (`/api/chat`) |
| `KV_REST_API_URL` | Arcade leaderboard storage (Vercel Upstash integration) |
| `KV_REST_API_TOKEN` | Arcade leaderboard storage (Vercel Upstash integration) |
| `UPSTASH_REDIS_REST_URL` | Same store when the KV names are not set |
| `UPSTASH_REDIS_REST_TOKEN` | Same store when the KV names are not set |

**Koji_Bot** builds its prompt from `shared/data/` at runtime. Update those JSON files and redeploy; no prompt editing needed.

### Arcade Leaderboards (Upstash Redis)

1. In Vercel: **Storage → Marketplace → Upstash Redis**
2. Create a database and **Connect** it to this project
3. Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (database name e.g. PortfolioLeaderboard)
4. Redeploy — Cyber Run, Memory Matrix, Binary Breaker, and Neon Chess each store a global top 3

Local dev: add the same Upstash env vars to `.env` and run `npm run dev`.

1. **Purchase Domain** (recommended: Cloudflare Registrar for best prices)
   - Go to [Cloudflare](https://www.cloudflare.com/products/registrar/) or [Namecheap](https://www.namecheap.com/)
   - Search for your desired domain (e.g., `kojidev.com`, `patchnotes.dev`)
   - Complete purchase

2. **Connect Domain to Vercel:**
   - In Vercel dashboard, go to your project → Settings → Domains
   - Add your custom domain
   - Follow Vercel's DNS configuration instructions
   - Update nameservers at your domain registrar if needed

3. **SSL Certificate:**
   - Vercel automatically provisions SSL certificates for custom domains
   - Wait a few minutes for DNS propagation

## 🎨 Customization

### Update Portfolio Content

Edit `shared/data/skills.json`, `shared/data/quests.json`, and `shared/data/profile.json` for portfolio facts. Menu items stay in `client/src/data/menu.json`.

### Background Videos

Place your background videos in `client/public/`:
- `bg.mp4` - First background video
- `neon.mp4` - Second background video

Update the video sources in `client/src/components/game/BackgroundVideo.tsx` if needed.

### Background Music

Replace `client/public/arcade.wav` with your own background music file.

## 📱 Responsive Design

The portfolio uses a left menu from the `md` breakpoint (768px) upward and a bottom bar on smaller screens. Sections scroll inside the CRT frame.

Template UI kit files under `client/src/components/ui`, plus the unused Drizzle and Passport dependencies, are not part of the live portfolio. They were left in place to avoid a late cleanup risk.

## 👤 Author

**Jesse Logan Elias Mashoana (Koji)**

- GitHub: [@J3ZZ3](https://github.com/J3ZZ3)
- Portfolio: [Your Domain Here]

## 📄 License

MIT License - feel free to use this as a template for your own portfolio!

---

**REWORK** - By Koji // System Core

