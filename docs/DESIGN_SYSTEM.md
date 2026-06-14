# GiveMeTech — Design System

Futuristic, neon-lit, holographic UI inspired by sci-fi interfaces.

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `void` | `#050510` | Primary background |
| `void-light` | `#0a0a1a` | Elevated surfaces |
| `void-elevated` | `#12122a` | Cards, inputs |
| `neon-cyan` | `#00f0ff` | Primary accent, links, glow |
| `neon-magenta` | `#ff00aa` | Alerts, featured badges |
| `neon-purple` | `#8b5cf6` | AI section, gradients |
| `neon-green` | `#00ff88` | Success, XP, security |
| `neon-orange` | `#ff6b00` | Gadgets section |
| `neon-yellow` | `#ffd700` | Achievements, highlights |
| `text-primary` | `#e8e8f0` | Body text |
| `text-secondary` | `#9898b0` | Descriptions |
| `text-muted` | `#606078` | Meta, timestamps |

### Section Themes

Each section has a unique accent triad defined in `src/styles/tokens.ts`:

- **AI** — Purple / Cyan / Magenta
- **Cybersecurity** — Green / Cyan / Gold
- **Gadgets** — Orange / Gold / Cyan
- **Software** — Cyan / Green / Purple
- **Space** — Blue / Purple / Gold
- **Gaming** — Magenta / Purple / Cyan

## Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Orbitron | 700–900 | Headlines, nav brand, section titles |
| Body | Rajdhani | 400–600 | Paragraphs, UI labels |
| Mono | JetBrains Mono | 400–600 | Code, meta, ticker, search |

### Scale

- Hero: `text-4xl` → `text-7xl`
- Section title: `text-3xl` → `text-5xl`
- Card title: `text-lg`
- Body: `text-sm` → `text-lg`
- Meta: `text-xs` / `text-[10px]`

## Glass Panels

```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
```

Hover states add colored glow shadows matching section theme.

## Glow Effects

```css
--glow-cyan: 0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.2);
```

Apply via `shadow-[var(--glow-cyan)]` or inline `boxShadow`.

## High Contrast Mode

Toggle adds `.high-contrast` to `<body>`:
- Text contrast increased to white / light gray
- Border opacity raised to 30%

## Accessibility

- All interactive elements have `:focus-visible` cyan outline
- `prefers-reduced-motion` disables animations
- Keyboard: `/` opens search, `Tab` navigates, `Esc` closes panels
- ARIA labels on all icon buttons and dialogs
