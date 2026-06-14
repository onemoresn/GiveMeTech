# GiveMeTech

An immersive, fully 3D interactive technology blog built with React, Three.js, and WebGL.

## Features

- **3D Homepage** — Rotating circuit-board globe with interactive article hotspots
- **Six Themed Sections** — Each with unique WebGL animations (neural networks, vault shields, devices, code streams, planets, portals)
- **Holographic UI** — Neon-lit glass panels, glowing accents, sci-fi typography
- **Interactive Elements** — Cursor-reactive 3D, parallax depth, scroll animations
- **Gamification** — XP, levels, badges for reading articles
- **Accessibility** — High contrast mode, keyboard navigation, reduced motion support

## RSS Feed (Daily News)

Live tech stories are pulled from RSS feeds and updated hourly.

```bash
npm run fetch-feeds          # Fetch latest stories now
```

See [docs/FEED_READER.md](docs/FEED_READER.md) for sources and categorization.

## Deploy (GitHub Pages)

Hosted at **https://onemoresn.github.io/GiveMeTech/** — auto-deploys on every push to `main`.

News refresh runs every hour (UTC), commits new stories, then triggers a redeploy.

See [docs/DEPLOY.md](docs/DEPLOY.md) for one-time setup (enable Pages → GitHub Actions source).

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 19** + TypeScript + Vite
- **Three.js** + React Three Fiber + Drei
- **Framer Motion** — UI animations
- **Tailwind CSS v4** — Styling
- **React Router** — Navigation

## Project Structure

```
src/
├── components/
│   ├── 3d/          # WebGL scenes
│   ├── features/    # Search, profile, newsletter, comments
│   ├── layout/      # Nav, ticker, footer
│   └── ui/          # Button, cards, badges
├── context/         # App state, gamification
├── data/            # Articles, sections
├── hooks/           # Media queries
├── pages/           # Home, section pages
└── styles/          # Design tokens
docs/
├── DESIGN_SYSTEM.md
├── ANIMATION_GUIDELINES.md
└── COMPONENT_LIBRARY.md
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Open search |
| `Esc` | Close panels |
| `Tab` | Navigate focusable elements |

## License

MIT
