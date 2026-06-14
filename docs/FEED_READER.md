# RSS Feed Reader

GiveMeTech pulls **live tech news** from 28+ public RSS feeds, categorizes stories into site sections, resolves topic-appropriate images, and publishes everything to `public/data/feed.json`.

## How it works

```
RSS Sources → fetch-feeds script → feed.json + images → GitHub push → Pages redeploy
```

1. **Fetch** — Pulls from general tech outlets plus section-specific feeds (OpenAI, Krebs, 9to5Mac, SpaceNews, IGN, etc.)
2. **Filter** — Last 7 days, deduplicates, skips Show HN / Ask HN noise, max 9 stories per section (54 total)
3. **Categorize** — Weighted keyword scoring with word-boundary matching, source boosts, and cross-section penalties
4. **Images** — RSS embed → Pexels (optional) → section fallback photo
5. **Publish** — Writes `public/data/feed.json` and downloads images to `public/images/feed/`

## RSS sources (28 feeds)

| Section | Sources |
|---------|---------|
| General | TechCrunch, The Verge, Ars Technica, Wired, MIT Tech Review, CNET, ZDNet |
| AI | OpenAI Blog, Google AI Blog, VentureBeat AI |
| Cybersecurity | Krebs on Security, BleepingComputer, The Hacker News |
| Gadgets | Engadget, 9to5Mac, Android Authority |
| Software | GitHub Blog, InfoQ, Dev.to, Hacker News |
| Space | NASA, Space.com, SpaceNews |
| Gaming | IGN, Polygon, Kotaku |

## Categorization rules

- **Weighted keywords** — Multi-word phrases (e.g. "machine learning") score higher than single tokens
- **Word boundaries** — Short terms like `ai`, `vr`, `game` use `\b` matching to reduce false positives
- **Source boost** — Topic-specific feeds add +5 to their section (e.g. Krebs → cybersecurity)
- **Penalties** — Cross-section rules demote miscategorization (e.g. "SpaceX IPO" won't land in software)
- **Skip patterns** — Show HN, Ask HN, Tell HN posts are excluded from Hacker News

Tune keywords in `scripts/feed-config.ts` → `SECTION_KEYWORDS` and `CROSS_SECTION_PENALTIES`.

## Manual update

```bash
npm run fetch-feeds
```

Optional Pexels key for better images when RSS lacks photos:

```bash
# .env
PEXELS_API_KEY=your_key_here
npm run fetch-feeds
```

## Daily automation

See [DEPLOY.md](./DEPLOY.md) for the full GitHub Pages hourly loop.

- **`update-feed.yml`** — Runs every hour at :00 UTC, commits feed changes
- **`deploy-pages.yml`** — Redeploys on every push to `main`

## File locations

| File | Purpose |
|------|---------|
| `scripts/fetch-feeds.ts` | Main fetch script |
| `scripts/feed-config.ts` | RSS sources, keywords, penalties |
| `scripts/lib/categorize.ts` | Scoring engine |
| `public/data/feed.json` | Generated feed |
| `src/context/FeedContext.tsx` | Runtime loader |
