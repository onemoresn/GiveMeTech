# Component Library

Reusable UI components in `src/components/`.

## UI Primitives

### Button
**Path:** `src/components/ui/Button.tsx`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `primary \| secondary \| ghost \| danger` | `primary` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Padding scale |
| `glow` | `boolean` | `false` | Cyan glow shadow |

### GlassCard
**Path:** `src/components/ui/GlassCard.tsx`

Frosted glass container with optional hover lift and colored glow.

### Badge
**Path:** `src/components/ui/Badge.tsx`

Pill label with color variants: `cyan`, `magenta`, `purple`, `green`, `orange`. Optional pulse animation.

### ArticleCard
**Path:** `src/components/ui/ArticleCard.tsx`

Section-themed article preview with variants:

| Variant | Section | Effect |
|---------|---------|--------|
| `node` | AI | Purple glow on hover |
| `encrypted` | Cybersecurity | Blur decrypt on hover |
| `terminal` | Software | Left border accent |
| `mission` | Space | Italic mission log style |
| `portal` | Gaming | Scale + magenta glow |
| `default` | Gadgets | Standard glass card |

### Accessibility
**Path:** `src/components/ui/Accessibility.tsx`

- `HighContrastToggle` — Body class toggle
- `XPBar` — Gamification progress indicator

## Layout

| Component | Path | Description |
|-----------|------|-------------|
| `NavBar` | `layout/NavBar.tsx` | Floating nav with animated icons |
| `NewsTicker` | `layout/NewsTicker.tsx` | Live breaking news scroll |
| `Footer` | `layout/Footer.tsx` | Site links + keyboard shortcuts |

## Features

| Component | Path | Description |
|-----------|------|-------------|
| `HolographicSearch` | `features/HolographicSearch.tsx` | Full-screen search with typing effect |
| `ProfilePanel` | `features/ProfilePanel.tsx` | 3D avatar customization + badges |
| `NewsletterSignup` | `features/NewsletterSignup.tsx` | Email form with energy pulse |
| `CommentBubbles` | `features/CommentBubbles.tsx` | Chat-style comment UI |

## 3D Scenes

| Component | Path | Section |
|-----------|------|---------|
| `GlobeScene` | `3d/GlobeScene.tsx` | Homepage |
| `NeuralNetworkScene` | `3d/NeuralNetworkScene.tsx` | AI |
| `VaultScene` | `3d/VaultScene.tsx` | Cybersecurity |
| `DevicesScene` | `3d/DevicesScene.tsx` | Gadgets |
| `TerminalScene` | `3d/TerminalScene.tsx` | Software |
| `CosmosScene` | `3d/CosmosScene.tsx` | Space |
| `PortalScene` | `3d/PortalScene.tsx` | Gaming |

## Usage Example

```tsx
import { ArticleCard } from '@/components/ui/ArticleCard'
import { Button } from '@/components/ui/Button'
import { getArticlesBySection } from '@/data/articles'

const articles = getArticlesBySection('ai')

articles.map((article, i) => (
  <ArticleCard
    key={article.id}
    article={article}
    variant="node"
    index={i}
    onClick={() => openArticle(article.id)}
  />
))
```

## Context

**AppProvider** (`src/context/AppContext.tsx`) provides:
- `profile` — User name, avatar, level, XP, badges
- `addXP(amount, articleId?)` — Gamification on read
- `highContrast` / `toggleHighContrast`
- `searchQuery` / `setSearchQuery`
