# Clavi — You hold the key

> Finance that serves the person, not the platform. Managed with full ownership and zero surveillance.

![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

**Clavi** — from Latin *clavis*, meaning key. 
A key does not store your wealth — it grants you access to it. Clavi was built on the same principle: your financial data belongs to you, and only you hold the key.

The name is short, rooted in history, and universally pronounceable — a quiet signal of the trust we place in your hands.

<!-- screenshot placeholder -->
<!-- ![Clavi screenshot](docs/screenshot.png) -->

## Features

- 🔒 **Privacy-first** — no analytics, no ads, no data selling
- 📱 **Apple-inspired design** with optional smooth animations
- 🧩 **Onboarding presets** (Freelancer, Household, Student, Traveller…)
- 🗂️ **Fully customisable** income & expense categories
- 🏦 **Simple mode** (1 account) or **Multi-Account mode**
- ☁️ **Cloud sync** via Supabase with full offline support (coming soon)
- 📤 **Export all your data** anytime (JSON + CSV)
- 🗑️ **Permanent account deletion** — no hoops
- 🌙 **Dark mode** + accessible, keyboard-navigable UI
- 📊 **Visual reports** with revenue/expense charts
- ⚡ **Fast & responsive** — optimised for mobile first

## Quick start

```bash
git clone https://github.com/your-org/clavi.git
cd clavi
pnpm install
cp .env.example .env.local   # fill in your Supabase keys
pnpm dev
```

Open http://localhost:3000 and sign up.

See [SETUP.md](./SETUP.md) for the full self-hosting guide.

## Self-hosting

Clavi is designed to be self-hosted. You need:
- A free Supabase project
- A Vercel account (or any Node.js host)
- A domain (optional but recommended)

Full instructions: [SETUP.md](./SETUP.md)

## Privacy

We built this because we believe your financial data is none of our business.

**No ads. No data selling.** Ever.

Operational security and delivery services in use:
- **Cloudflare Proxy + CDN** for request routing, caching, and edge protection
- **Cloudflare Nameservers** for DNS management and resilience
- **Cloudflare Protection** (including DDoS/WAF style edge protections)
- **Cloudflare Turnstile** for bot protection on auth flows
- **Vercel Hosting** for app hosting and runtime execution

Cloudflare resources/endpoints that may appear in requests:
- `challenges.cloudflare.com` (Turnstile challenge runtime)
- `static.cloudflareinsights.com` (Cloudflare insights tracker script)

Read our full [Privacy Policy](./app/(app)/privacy/page.tsx) and [Terms of Use](./app/(app)/terms/page.tsx).

## Architecture

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Type-safe, production-ready SSR/SSG |
| Styling | Tailwind CSS | Utility-first, responsive design |
| Animation | Framer Motion | Performant, accessible motion |
| State | localStorage + Zustand (coming) | Offline-first, minimal deps |
| Database | Supabase (PostgreSQL) | Open-source, privacy-friendly, real-time |
| Auth | Supabase Auth | Email + password, no vendor lock-in |
| Hosting | Vercel | Optimal Next.js deployment |
| DNS | Cloudflare | Fast, reliable nameserver + DDoS protection |
| Package manager | pnpm | Faster, more reliable than npm/yarn |

## Project structure

```
ledger/
├── app/
│   ├── (auth)/                    # Public auth pages (login, signup)
│   ├── (app)/                     # Protected user pages (dashboard, etc.)
│   ├── (marketing)/               # Marketing pages (privacy, terms)
│   ├── api/                       # Server-side API routes
│   └── layout.tsx, globals.css    # Root layout & styles
├── components/
│   ├── layout/                    # Nav, footer, sidebar
│   ├── ui/                        # Reusable buttons, inputs (coming)
│   └── onboarding/                # Wizard components (coming)
├── lib/
│   ├── supabase/
│   │   ├── client.ts              # Browser Supabase client
│   │   └── server.ts              # Server-only (Service Role Key)
│   ├── presets.ts                 # Onboarding persona presets
│   └── utils.ts                   # Formatting, helpers
├── public/
│   ├── assets/                    # Logo, icons
│   └── manifest.json              # PWA config
├── supabase/
│   └── 001_init.sql               # Database schema + RLS
├── .env.example                   # Commit this, never .env.local
├── .gitignore
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
├── package.json
├── SETUP.md                       # Self-hosting guide
└── README.md                      # This file
```

## Roadmap

### Phase 1
- [x] Project structure & scaffolding
- [x] Authentication (Supabase)
- [x] Onboarding wizard
- [x] Basic dashboard
- [x] Transaction add/edit/delete
- [x] Privacy policy page 
- [x] Unified branding (Clavi)

### Phase 2
- [x] Reports (charts)
- [x] Data export (JSON + CSV)
- [x] Account deletion
- [x] Dark mode toggle
- [x] Offline support (Service Worker)
- [x] PWA installation

### Phase 3
- [x] Multi-account mode
- [x] Category management (drag-to-reorder)
- [x] Recurring transactions
- [x] Search & filters
- [x] Mobile optimisations (swipe, drag-to-dismiss)

### Phase 4+
- [x] Budget tracking
- [x] Tags / notes
- [ ] Receipt uploads
- [ ] Bank sync (Plaid integration)
- [ ] Collaborative budgeting
- [ ] Internationalization (i18n)

## Tech stack

- **Next.js 14** — React framework with built-in SSR, API routes, Image optimization
- **TypeScript** — Type safety across the codebase
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Animations (motion toggle for accessibility)
- **Supabase** — PostgreSQL + Auth + Realtime
- **Recharts** — Charts & data visualization
- **Lucide React** — Icon library
- **dnd-kit** — Drag-and-drop for category reorder
- **next-pwa** — Progressive Web App support
- **pnpm** — Fast package manager

## Design language

Apple-inspired, minimalist design:
- **Colours**: White/black background, `#007AFF` accent, `#636366` secondary text
- **Typography**: System font stack (`-apple-system`, `BlinkMacSystemFont`, etc.)
- **Spacing**: 8-pt grid, generous whitespace
- **Shadows**: Subtle only (`0 2px 20px rgba(0,0,0,0.06)`)
- **Radius**: 16px cards, 12px inputs, 9999px pills
- **Dark mode**: Full support, toggled via Settings

## Browser support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- iOS Safari 14.5+

## Accessibility

- WCAG 2.1 AA compliance target
- Full keyboard navigation
- Semantic HTML
- `prefers-reduced-motion` support
- Colour contrast ≥ 4.5:1 (AA)

## Performance

- Initial JS bundle: **< 200 kB gzipped** (dashboard route)
- Core Web Vitals: **Good** target
- Code splitting via Next.js App Router
- Image optimization via `next/image`
- Font loading via `next/font` with `display: swap`

## Security

- Cloudflare Proxy/CDN/Nameservers protection in front of app traffic
- Cloudflare Turnstile enabled on login/signup
- Cloudflare insights script can load from `static.cloudflareinsights.com`
- Supabase Row Level Security (RLS) on every table
- Service Role Key kept server-side only
- Secrets managed via `.env.local` (never committed)
- ESLint rule enforces Service Role Key isolation
- Pre-commit hook via gitleaks prevents secret leaks

## License

MIT

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) (coming soon).

**Easy first contribution**: Add a new persona preset to `/lib/presets.ts`.

## Support

- **Docs**: [SETUP.md](./SETUP.md) for self-hosting
- **Issues**: GitHub Issues for bug reports
- **Privacy questions**: privacy@bunorden.com
- **Community**: Discussions on GitHub

---

<p align="center">
  Made with ❤️ by <a href="https://bunorden.com">Bunorden</a>
  <br/>
  Built with Next.js + Supabase + Privacy
</p>
