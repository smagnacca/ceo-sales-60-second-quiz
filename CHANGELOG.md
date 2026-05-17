# Changelog — CEO Sales 60-Second Quiz

## 2026-05-17 — Project Extracted to Standalone Repo (Session 1)

### What was done

**Context:** The CEO Sales 60-Second Quiz landing page was previously bundled inside the `code-cowork-2026-7-marketing-outreach` repo as a `landing-page/` subfolder — a poor fit since the quiz site is a separate product with its own Netlify site, domain, and lifecycle.

**Discovery:** During extraction, found that the Netlify site (`ceo-sales-60-second-quiz-outreach.netlify.app`, ID `20e7d9ad-c961-4d75-a120-e342f2ed5a74`) was originally linked to a separate, older repo (`CEO_Sales_60_Second-Quiz-Outreach`) that contained the full-featured version of the site (262KB index.html with UTM tracking, submit-lead.js function, email-header.png, _headers). The `landing-page/` copy in marketing-outreach was a stripped-down version (156KB). The old repo was used as the canonical source.

**Steps completed:**
1. Created new GitHub repo: [smagnacca/ceo-sales-60-second-quiz](https://github.com/smagnacca/ceo-sales-60-second-quiz)
2. Created local project folder: `~/Documents/Claude/Projects/ceo-sales-60-second-quiz/`
3. Pulled canonical files from old `CEO_Sales_60_Second-Quiz-Outreach` repo (full index.html, _headers, email-header.png, submit-lead.js, contact-form.js, all images)
4. Created project docs: CLAUDE.md, CHANGELOG.md, MEMORY.md, netlify.toml, .gitignore
5. Pushed initial commit + canonical file update to new repo (commits: `17f4869`, `5f31f13`)
6. Relinked Netlify site to new repo via API (GitHub auto-deploy not yet active — Netlify GitHub app not authorized)
7. Deployed via zip upload API — confirmed `state: ready`
8. Removed `landing-page/` folder from `code-cowork-2026-7-marketing-outreach` and pushed (commit: `34297d4`)
9. Updated CLAUDE.md deploy protocol — API zip deploy is now the documented standard for each session

### Deploy method
API zip upload (not GitHub auto-deploy). See CLAUDE.md for the deploy command.

### Commits this session
- `17f4869` — feat: initial commit — CEO Sales 60-Second Quiz standalone project
- `5f31f13` — fix: replace with canonical files from original CEO quiz repo

### Next steps
- Enable GitHub auto-deploy (Netlify dashboard → Link repository) to remove manual deploy requirement
- Review index.html for any desired content or design updates
- Confirm which images are still needed (some format-*.jpg files may be unused)
