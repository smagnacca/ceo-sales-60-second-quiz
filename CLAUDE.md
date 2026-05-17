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

- Push to `main` → Netlify auto-deploys
- No build step needed (static HTML)
- Verify deploy: poll Netlify API until `state: ready`

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
