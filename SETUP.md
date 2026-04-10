# Clavi — Setup Guide

A privacy-first, open-source bookkeeping app by Bunorden.

## Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account
- A [Cloudflare](https://cloudflare.com) account (for your domain)

## 1. Clone & install

```bash
git clone https://github.com/your-org/clavi.git
cd clavi
pnpm install
```

## 2. Supabase setup

1. Create a new Supabase project at https://app.supabase.com
2. In the SQL Editor, run the contents of `/supabase/001_init.sql`
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
4. In **Authentication → Providers**, enable **Email** (with email confirmation if you want)
5. In **Storage**, create a bucket called `avatars` (public read, authenticated write)

## 3. Environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the three values from step 2. Never commit this file.

| Variable | Safe to expose? | Used where |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes (public) | Client + Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes (public) | Client + Server |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ **Never** | Server only (`/app/api/`) |

## 4. Protecting secrets in an open-source repo

**This project is open source. Follow these steps before pushing.**

### .gitignore
`.env.local` is already in `.gitignore`. Double-check before every commit.

### gitleaks (pre-commit secret scanner)

```bash
# macOS / Linux
brew install gitleaks  # or download from https://github.com/gitleaks/gitleaks/releases

# Windows (via scoop or direct download)
scoop install gitleaks

# Add pre-commit hook
echo 'gitleaks protect --staged -v' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### GitHub Secret Scanning
1. Go to your repo → **Settings → Security → Secret scanning**
2. Enable **Secret scanning** and **Push protection** (free for public repos)

### Never do these things
- ❌ Never paste `SUPABASE_SERVICE_ROLE_KEY` in any client file
- ❌ Never run `vercel env add` with secrets in your terminal history — use the Dashboard instead
- ❌ Never log environment variables in `console.log`
- ❌ Never commit `.env.local`, `.env.production`, or any file with real credentials

## 5. Cloudflare + Vercel DNS

1. **Add domain on Vercel**: Project → Settings → Domains → add your domain
2. Vercel gives you a CNAME value (e.g. `cname.vercel-dns.com`)
3. In **Cloudflare DNS**: add a CNAME record for `@` (or `www`) pointing to that value
4. Set the proxy status to **DNS only (grey cloud)** initially — Vercel manages SSL
5. Once the domain is verified, you can switch to **Proxied (orange cloud)** if you want Cloudflare's CDN; but set **SSL/TLS → Full (Strict)** mode first to avoid redirect loops
6. Add `www` → root redirect in Cloudflare **Rules → Redirect Rules** if needed

## 6. Bunorden logo

The logo files should be at:
```
public/assets/bunorden-logo.png
public/assets/bunorden-logo.svg (optional fallback)
```

If you don't have the SVG, the PNG alone is sufficient. The footer component loads from these paths automatically.

## 7. Run locally

```bash
pnpm dev
```

Open http://localhost:3000

## 8. Deploy to Vercel

### Option A — GitHub auto-deploy (recommended)
1. Push your repo to GitHub
2. Import the project at https://vercel.com/new
3. In **Environment Variables**, add all three variables from step 3
4. Vercel deploys automatically on every push to `main`

### Option B — CLI
```bash
pnpm vercel --prod
```
(Add env vars via the Vercel Dashboard, not CLI flags)

## 9. Privacy checklist before going live

- [ ] Update `privacy@bunorden.com` in the Privacy Policy to a real address
- [ ] Confirm no third-party scripts are loaded (audit with browser DevTools → Network)
- [ ] Confirm no `console.log` statements leak user data
- [ ] Run `gitleaks detect` on the full repo history: `gitleaks detect --source . -v`
- [ ] Enable GitHub Secret Scanning on the repo
- [ ] Test the Privacy Policy page to ensure it renders correctly
- [ ] Verify Supabase RLS policies are enabled on all tables

## 10. Database backups

Supabase automatically backs up your database. To manually export:
1. Go to **Supabase Dashboard → Backups**
2. Download the backup file

To restore:
1. Create a new Supabase project
2. In **SQL Editor**, run the contents of your backup
3. Update `NEXT_PUBLIC_SUPABASE_URL` and keys

## 11. Monitoring

- **Supabase Dashboard**: monitor API usage, database performance, auth logs
- **Vercel Dashboard**: monitor build logs, deployment status, function metrics
- **Cloudflare Analytics**: monitor domain traffic and cache hit rates

## 12. Contributing

See the main README.md for contributing guidelines. Community contributions to presets and features are encouraged!
