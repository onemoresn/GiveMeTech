# Deploy to GitHub Pages

Production URL: **https://give-me-tech.com**

Fallback (before DNS): **https://onemoresn.github.io/GiveMeTech/**

## Hourly update loop

Two GitHub Actions workflows run the full cycle:

```
Every hour (:00 UTC)  →  update-feed.yml
                     →  Fetches RSS + images
                     →  Commits feed.json to main

                     →  deploy-pages.yml (triggered by push)
                     →  Builds site (root base path /)
                     →  Publishes to GitHub Pages
```

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `update-feed.yml` | Hourly cron + manual | Fetch feeds, commit `public/data/feed.json` |
| `deploy-pages.yml` | Every push to `main` | Build & deploy to GitHub Pages |

## One-time GitHub setup

1. Push this repo to **github.com/onemoresn/GiveMeTech**
2. **Settings → Pages → Build and deployment** → Source: **GitHub Actions**
3. **Settings → Pages → Custom domain** → enter: `give-me-tech.com` → Save
4. Wait for DNS check, then enable **Enforce HTTPS**
5. (Optional) Add `PEXELS_API_KEY` under **Settings → Secrets and variables → Actions**

The `public/CNAME` file in this repo tells GitHub Pages to serve the site at your domain.

## Squarespace DNS for give-me-tech.com

In **Squarespace → Settings → Domains → give-me-tech.com → DNS Settings**, add:

### Root domain (required)

Four **A** records for host `@`:

| Type | Host | Value |
|------|------|-------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

### www subdomain (recommended)

| Type | Host | Value |
|------|------|-------|
| CNAME | `www` | `onemoresn.github.io` |

In GitHub **Custom domain**, you can use `give-me-tech.com` only, or add `www.give-me-tech.com` as well and enable redirect in GitHub/Squarespace.

Remove any Squarespace **A** or **CNAME** records that conflict with the rows above (old Squarespace site hosting).

DNS can take **15 minutes to 48 hours** to propagate.

## Local development

```bash
npm run dev          # http://localhost:5173
npm run fetch-feeds  # Refresh feed.json locally
npm run build        # Production build (base path /)
npm run preview
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Domain not verified on GitHub | Wait for DNS; confirm A records in Squarespace |
| Site loads but no CSS/images | Ensure deploy uses `VITE_BASE_PATH: /` (already configured) |
| SSL certificate pending | Wait up to 24h after DNS verifies; keep Enforce HTTPS on |
| Still see old Squarespace site | Clear DNS cache; confirm conflicting records removed |
