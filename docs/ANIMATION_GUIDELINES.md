# Animation Guidelines

Performance target: **60fps** on desktop, **30fps+** on mobile.

## Principles

1. **GPU-first** — Animate `transform` and `opacity` only in UI; use WebGL for 3D.
2. **Layer depth** — Parallax via scroll-linked transforms and 3D camera orbit.
3. **Micro-interactions** — Hover scale (1.03), tap scale (0.97), card lift (-4px to -6px).
4. **Reduced motion** — Respect `prefers-reduced-motion`; disable ticker scroll and 3D auto-rotate.

## Timing

| Token | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `fast` | 150ms | smooth | Button hover |
| `normal` | 300ms | smooth | Card transitions |
| `slow` | 600ms | smooth | Page reveals |
| `glacial` | 1200ms | smooth | Hero entrance |
| `spring` | — | stiffness 300, damping 30 | Nav bar, modals |

## CSS Keyframes

| Name | Duration | Use |
|------|----------|-----|
| `ticker-scroll` | 40s linear | Breaking news ticker |
| `hologram-flicker` | 4s | Search overlay, hero tagline |
| `energy-pulse` | 3s | Newsletter signup border |
| `decrypt` | 0.5s | Cybersecurity article hover |
| `pulse-glow` | 2s | Badge pulse |
| `float` | 3s | Decorative elements |

## Framer Motion Patterns

### Scroll reveal
```tsx
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-50px' }}
transition={{ delay: index * 0.1, duration: 0.5 }}
```

### Modal
```tsx
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.9 }}
```

### Stagger
Use `delay: index * 0.1` on list items for cascading entrance.

## WebGL / Three.js

| Scene | Technique | Performance |
|-------|-----------|-------------|
| Globe | Icosahedron wireframe + hotspots | `dpr: [1, 2]` desktop |
| Neural Network | Line connections + emissive nodes | Cursor-reactive rotation |
| Vault | Wireframe octahedron + torus rings | Low poly count |
| Devices | Box geometry + OrbitControls | User-driven rotation |
| Terminal | Text + floating panel | Minimal geometry |
| Cosmos | Spheres + orbiting satellite | Stars instanced |
| Portal | Animated torus rings | Scale pulse sine wave |

### Optimization
- Mobile: `dpr: 1`, reduced antialiasing
- Lazy `Suspense` on all Canvas mounts
- `powerPreference: 'high-performance'`
- Disable auto-rotate when `prefers-reduced-motion`

## 3D Interaction Concepts

1. **Globe hotspots** — Click sphere → navigate to article
2. **Neural network** — Pointer move tilts the network graph
3. **Device scene** — OrbitControls: spin, zoom, explore
4. **Encrypted cards** — Blur-to-clear on hover (CSS `decrypt` keyframe)
5. **Portal rings** — Continuous rotation + scale pulse for gaming section
