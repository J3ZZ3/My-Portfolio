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
│   │   ├── data/              # JSON data files (skills, quests, etc.)
│   │   ├── pages/             # Page components
│   │   └── lib/               # Utilities
│   └── public/                # Static assets (videos, images)
├── server/                    # Express server
└── shared/                    # Shared schemas
```

## 📝 Data Management

All portfolio content is managed through JSON files in `client/src/data/`:

- `menu.json` - Navigation menu items
- `skills.json` - Skills and tools inventory
- `quests.json` - Projects/quests with links and status
- `arcade.json` - Arcade game configurations
- `profile.json` - Profile information and stats

Simply edit these JSON files to update your portfolio content without touching code!

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
| `KV_REST_API_URL` | Arcade leaderboard storage (Vercel Upstash integration) |
| `KV_REST_API_TOKEN` | Arcade leaderboard storage (Vercel Upstash integration) |
| `GROQ_API_KEY` | Powers Koji_Bot in the COMMS tab (`/api/chat`) |

**Koji_Bot** reads project data from `client/src/data/quests.json` at runtime — update quests there and redeploy; no prompt editing needed.

### Arcade Leaderboards (Upstash Redis)

1. In Vercel: **Storage → Marketplace → Upstash Redis**
2. Create a database and **Connect** it to this project
3. Vercel auto-injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (database name e.g. PortfolioLeaderboard)
4. Redeploy — each arcade game (Cyber Run, Memory Matrix, Binary Breaker) stores a global top 3

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

Edit the JSON files in `client/src/data/`:
- Add/remove skills in `skills.json`
- Add new projects in `quests.json`
- Update profile info in `profile.json`
- Modify menu items in `menu.json`

### Background Videos

Place your background videos in `client/public/`:
- `bg.mp4` - First background video
- `neon.mp4` - Second background video

Update the video sources in `client/src/components/game/BackgroundVideo.tsx` if needed.

### Background Music

Replace `client/public/arcade.wav` with your own background music file.

## 📱 Responsive Design

The portfolio is fully responsive with breakpoints optimized for:
- Desktop (> 1024px)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 👤 Author

**Jesse Logan Elias Mashoana (Koji)**

- GitHub: [@J3ZZ3](https://github.com/J3ZZ3)
- Portfolio: [Your Domain Here]

## 📄 License

MIT License - feel free to use this as a template for your own portfolio!

---

**REWORK** - By Koji // System Core

