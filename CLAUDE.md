# CEO Sales 60-Second Quiz

## Project Overview

| Key | Value |
|-----|-------|
| **Live URL** | https://ceo-sales-60-second-quiz-outreach.netlify.app |
| **GitHub repo** | https://github.com/smagnacca/ceo-sales-60-second-quiz |
| **Netlify site ID** | 20e7d9ad-c961-4d75-a120-e342f2ed5a74 |
| **Project folder** | `~/Documents/Claude/Projects/ceo-sales-60-second-quiz/` |
| **Branch** | main |

## What This Is

A landing page / outreach site for Scott's CEO Sales 60-Second Quiz. Used as a destination for LinkedIn outreach and email campaigns targeting sales leaders and executives. The quiz funnel drives leads into the Sales Sprint and course offers.

## File Structure

```
/
├── index.html                  # Main landing page (single file site)
├── netlify.toml                # Netlify build config (publishes from root)
├── netlify/functions/
│   └── contact-form.js         # Netlify function for form submissions
├── *.png / *.jpg               # Images (Buffett carousel, Scott headshot, format cards)
├── CLAUDE.md                   # This file
├── CHANGELOG.md                # Version history
└── MEMORY.md                   # Project-specific gotchas and decisions
```

## Deploy Process

**Deploy via Netlify API zip upload every session** (GitHub auto-deploy is NOT active — the Netlify GitHub app has not been authorized for this repo).

### Standard deploy command (run after any code change + git push):

```bash
NETLIFY_TOKEN=$(cat ~/.claude/tokens/.netlify_token)
SITE_ID="20e7d9ad-c961-4d75-a120-e342f2ed5a74"

# 1. Zip site files (exclude dev/meta files)
cd ~/Documents/Claude/Projects/ceo-sales-60-second-quiz
zip -r /tmp/ceo-quiz-deploy.zip . \
  --exclude "*.git*" \
  --exclude "*/node_modules/*" \
  --exclude ".gitignore" \
  --exclude "CLAUDE.md" \
  --exclude "CHANGELOG.md" \
  --exclude "MEMORY.md"

# 2. Upload and poll until ready
DEPLOY_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $NETLIFY_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary @/tmp/ceo-quiz-deploy.zip \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" | python3 -c "import json,sys; print(json.load(sys.stdin).get('id',''))")

until [ "$(curl -s -H "Authorization: Bearer $NETLIFY_TOKEN" \
  "https://api.netlify.com/api/v1/deploys/$DEPLOY_ID" | python3 -c "import json,sys; print(json.load(sys.stdin).get('state',''))")" = "ready" ]; do
  sleep 5
done
echo "✅ Deployed: https://ceo-sales-60-second-quiz-outreach.netlify.app"
```

### To enable GitHub auto-deploy (one-time manual step):
Go to Netlify dashboard → Site Settings → Build & Deploy → Link repository → authorize the `ceo-sales-60-second-quiz` repo. After that, push to `main` will trigger auto-deploys.

- No build step needed (static HTML)
- Always verify: poll until `state: ready` before reporting done

## Tokens

- `NETLIFY_TOKEN` — `~/.claude/tokens/.netlify_token`
- `GITHUB_TOKEN` — `~/.claude/tokens/.github_token`

## Brand / Design

- Gold: `#f5a623` / `#C9A84C`
- Cyan: `#00d4ff`
- Navy: `#1a1a1a`
- Font: match existing site style

## Don't Break

- Netlify form submission (contact-form.js function)
- Buffett carousel images and animation
- Mobile responsiveness
- Live URL routing (publish from root, not a subfolder)
