# Clavi — You hold the key
<p align="center">
  <img src="public/assets/clavi-icon-dark.svg" width="80" height="80" alt="Clavi Logo" />
</p>

> **Managed with full ownership. Zero surveillance.** Finance that serves the person, not the platform.

![Next.js](https://img.shields.io/badge/Next.js_14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Privacy](https://img.shields.io/badge/Privacy-100%25-blueviolet)

**Clavi** (Latin: *Key*) is a premium, privacy-first financial vault designed for those who demand absolute control over their data. Unlike traditional trackers, Clavi is built on a **Unified Fluid Surface** architecture — a high-performance, Apple-inspired interface that prioritizes speed, security, and anonymity.

---

## 💎 The Clavi Standard

### 🛡️ Zero-Tracker Infrastructure
We have purged all third-party dependencies that involve external tracking. 
- **Native Typography:** No Google Fonts. Clavi exclusively utilizes the native **SF Pro** system font stack to ensure zero font-tracking and maximum performance.
- **No Analytics:** We do not track your clicks, your balance, or your behavior. Your financial habits are your business.
- **Vault Secured:** All data is encrypted and managed via your own Supabase instance.

### 🌊 Unified Fluid Surface
A design language built for the modern era:
- **Premium Aesthetics:** Vibrant gradients, glassmorphism, and dynamic micro-animations.
- **Adaptive Precision:** Fully responsive layouts that behave like native apps on iOS and Android.
- **High Contrast:** Optimized for readability in both Sleek Dark and Pure Light modes.

---

## 🚀 Features

- 🏦 **Multi-Account Vaults:** Manage personal, business, and savings accounts in one interface.
- 📊 **Insightful Intelligence:** Visual reports with category-based spending and monthly trends.
- 🎯 **Budget Protocols:** Real-time budget tracking with visual "glow" progress indicators.
- 🔑 **Next-Gen Security:** Native 2FA (Multi-Factor Authentication) built into the vault core.
- 📤 **Data Sovereignty:** Export your entire vault history to JSON/CSV at any time.
- 🗑️ **Permanent Erasure:** One-click account deletion. When you leave, your data is truly gone.

---

## 🛠️ Architecture

| Layer | Choice | Rationale |
|---|---|---|
| **Core** | Next.js 14 | Rapid server-side rendering with absolute type safety. |
| **Typography** | SF Pro (Native) | Zero-tracker privacy + premium Apple aesthetic. |
| **Identity** | Supabase Auth | Robust encryption with optional MFA support. |
| **Storage** | PostgreSQL | Industrial-grade data integrity and RLS security. |
| **Motion** | Fluid Transitions | Custom CSS keyframes for a "breathing" UI feel. |

---

## 🔐 Privacy Blueprint

Clavi was built because we believe financial data is a human right, not a commodity.
- **No Ads.**
- **No Data Selling.**
- **No Third-Party Scripts.**

Read our transparent [Privacy Policy](./app/(app)/privacy/page.tsx) and [Terms of Service](./app/(app)/terms/page.tsx).

---

## 📦 Setup & Deployment

```bash
git clone https://github.com/bunorden/clavi.git
cd clavi
pnpm install
cp .env.example .env.local
pnpm dev
```

*Self-hosting guide available in [SETUP.md](./SETUP.md).*

---

<p align="center">
  Built with ❤️ by <a href="https://bunorden.com">Bunorden</a>
  <br/>
  <b>The Key is Yours.</b> 🗝️
</p>
