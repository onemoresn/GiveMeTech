# Deploy to GitHub Pages

GiveMeTech is configured for **onemoresn/GiveMeTech** at:

**https://onemoresn.github.io/GiveMeTech/**

## Hourly update loop

Two GitHub Actions workflows run the full cycle:

```
Every hour (:00 UTC)  →  update-feed.yml
                     →  Fetches RSS + images
                     →  Commits feed.json to main

                     →  deploy-pages.yml (triggered by push)
                     →  Builds site with /GiveMeTech/ base path
                     →  Publishes to GitHub Pages
```

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `update-feed.yml` | Hourly cron + manual | Fetch feeds, commit `public/data/feed.json` |
| `deploy-pages.yml` | Every push to `main` | Build & deploy to GitHub Pages |

## One-time setup

1. Push this repo to **github.com/onemoresn/GiveMeTech**
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set **Source** to **GitHub Actions**
4. (Optional) Add `PEXELS_API_KEY` under **Settings → Secrets and variables → Actions**
5. Push to `main` or run **Deploy to GitHub Pages** manually from the Actions tab

After the first successful deploy, your site is live at the URL above.

## Local development

```bash
npm run dev          # http://localhost:5173 (base path /)
npm run fetch-feeds  # Refresh feed.json locally
npm run build        # Production build for root path
```

To preview the GitHub Pages build locally:

```bash
# PowerShell
$env:VITE_BASE_PATH="/GiveMeTech/"; npm run build; npm run preview
```

## If you rename the repo

Update `VITE_BASE_PATH` in `.github/workflows/deploy-pages.yml` to match your repo name:

```yaml
VITE_BASE_PATH: /YourRepoName/
```
