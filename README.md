# Guiding Light Apostolic Church — Website

Static HTML/CSS/JS site with a Decap CMS admin panel so church staff can manage events without touching code.

## Local preview

```
python3 -m http.server 5503
```

Then visit `http://localhost:5503`.

## How event editing works

Events live in a single file: **`content/events.json`**. The homepage and `events.html` both pull from this file at page load (via `js/events.js`) and render cards with your existing design.

Church staff edit events through the **`/admin`** page, which is powered by [Decap CMS](https://decapcms.org/) (formerly Netlify CMS). They log in with their email, fill out a form, click **Publish**, and the changes go live after Netlify's auto-deploy finishes (usually under a minute).

### Fields the staff see

- **Title** — e.g. *"Spring Revival 2026"*
- **Date (friendly text)** — e.g. *"May 4–8, 2026 · Nightly 7 PM"*
- **Category** — dropdown (Revival / Community / Youth / Children / Christmas / etc.) — sets the card color
- **Description** — 2–3 sentences
- **Image (optional)** — upload a flyer or photo; if blank, the category color is used
- **Feature on homepage** — checkbox; checked = shows in the homepage "Upcoming" section (first 3)
- **Action link text / URL (optional)** — e.g. "Register" → `https://example.com/register`

They can drag to reorder, duplicate, or delete events.

---

## One-time deploy setup (Netlify)

### 1. Push this folder to a GitHub repo

```
git init
git add .
git commit -m "Initial site"
gh repo create guidinglight-site --public --source=. --push
```

### 2. Connect Netlify to the repo

- Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
- Pick the GitHub repo
- Build command: *(leave blank)*
- Publish directory: `.`
- Deploy

### 3. Enable Identity (the login system)

- In your new Netlify site dashboard → **Identity** → **Enable Identity**
- **Registration preferences** → set to **Invite only** (so random people can't sign up)
- **External providers** (optional) → enable Google so staff can log in with their existing Google account

### 4. Enable Git Gateway (so Decap can commit changes)

- Still in Identity settings → scroll to **Services** → **Git Gateway** → **Enable**

### 5. Invite the church staff

- Netlify site dashboard → **Identity** → **Invite users** → enter their email
- They'll receive an invite email with a link. When they click it, they set a password and land on `/admin` logged in.

### 6. Done — they can now edit

Give them this link: `https://YOUR-SITE.netlify.app/admin`

---

## Folder layout

```
.
├── index.html                # Homepage
├── about.html                # About + Pastor + Beliefs
├── visit.html                # Plan a visit
├── watch.html                # Watch / sermons
├── ministries.html           # Ministries
├── events.html               # Events (dynamic)
├── give.html                 # Give
├── contact.html              # Contact
│
├── admin/
│   ├── index.html            # Decap CMS admin shell
│   └── config.yml            # CMS collection config
│
├── content/
│   └── events.json           # ← Events live here. Edited via /admin.
│
├── assets/
│   ├── hero-worship.jpg      # Hero stock photo
│   ├── Pastor.png            # Pastor photo
│   └── uploads/              # Images staff upload via CMS
│
├── css/styles.css
├── js/main.js
├── js/events.js              # Loads events.json + renders cards
│
├── netlify.toml              # Deploy config (headers, publish dir)
└── README.md
```

## Editing pages that aren't events

Events are the only CMS-driven page. Everything else (Pastor bio, beliefs, service times, FAQ) is in the HTML files directly and requires editing the files and redeploying. If the church ends up wanting to edit more pages themselves, we can extend the CMS config to cover more collections.

## Troubleshooting

- **Events don't show after edit in /admin** — wait 30–60s for Netlify to finish its auto-deploy. Refresh the page.
- **Staff can't log in at /admin** — confirm Identity is enabled and they've accepted their invite email.
- **"You need to log in with git-gateway" error** — make sure Git Gateway is enabled in Netlify Identity settings.
- **Want to preview the admin UI locally** — run `npx decap-server` in a second terminal, then edit `admin/config.yml` temporarily to `backend: { name: proxy, proxy_url: http://localhost:8081/api/v1 }`. Revert before deploying.
