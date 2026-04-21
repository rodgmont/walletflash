# Flash Wallet & Business Integration Platform

**Plan B Dev Track — entrega**

Flash is a Bitcoin Lightning and Mobile Money platform for Francophone West Africa (Benin, Togo, Côte d’Ivoire). This repository is an **open-source Next.js application** that demonstrates **Lightning Address / LNURL-pay (LUD-16)**, a **server-side proxy** to Flash’s **sell** flow, a **merchant checkout script**, and a **guided onboarding** aligned with the assignment brief.

---

## Scope (assignment areas)

1. **Wallet & automation (Lightning Address)**  
   Public **LUD-16** metadata at `/.well-known/lnurlp/[username]` and LNURL callback at `/api/lnurl/callback/[username]`. The callback returns a **simulated** BOLT11 string for local demos; in production you plug in a real Lightning backend and notify `POST /api/webhooks/lightning-payment` when an invoice settles so the server can call Flash **sell** with the user’s saved MoMo route.

2. **Business integration (CDN “SDK”)**  
   `public/flash-checkout.js` — drop-in script + `data-*` attributes. `public/demo.html` shows a minimal store page. The script resolves LNURL against the **same origin** as the script URL (host the file from your deployed wallet app).

3. **Onboarding**  
   Three-step client flow (alias, MoMo provider + MSISDN, confirmation) with validation; persists users via `src/lib/db.ts` (local JSON file — see below).

---

## Architecture (actual paths)

| Component | Path |
|-----------|------|
| LUD-16 | `src/app/.well-known/lnurlp/[username]/route.ts` |
| LNURL callback | `src/app/api/lnurl/callback/[username]/route.ts` |
| Sell proxy | `src/app/api/sell/route.ts` |
| Sell logic (shared) | `src/lib/execute-sell.ts` |
| Lightning settlement webhook | `src/app/api/webhooks/lightning-payment/route.ts` |
| User CRUD | `src/app/api/user/route.ts` + `src/lib/db.ts` |
| Merchant script | `public/flash-checkout.js` |
| Demo store | `public/demo.html` |
| Deliverables index | `DELIVERABLE.MD` |

---

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **ESLint** (`eslint-config-next`)
- **CSS Modules** for primary screens (`page.module.css`, `dashboard.module.css`) + shared tokens in `globals.css`
- **LNURL** / Lightning Address concepts: [lightningaddress.com](https://lightningaddress.com/)

---

## Setup

### Prerequisites

- Node.js **18+**
- npm

### Install

```bash
git clone https://github.com/rodgmont/walletflash.git
cd walletflash
npm install
cp .env.example .env.local
```

Edit `.env.local` — see `.env.example` for all variables. **`data.json` is git-ignored**; the app creates it when users register. `data.example.json` documents an empty store.

### Run

```bash
npm run dev
```

- Onboarding / dashboard: [http://localhost:3000](http://localhost:3000)  
- Merchant demo: [http://localhost:3000/demo.html](http://localhost:3000/demo.html)

### Flash API

Official reference: [https://docs.bitcoinflash.xyz](https://docs.bitcoinflash.xyz).  
If the documented JSON body for `POST /transactions/sell` differs from the default mapping in `src/lib/execute-sell.ts`, extend the payload using **`FLASH_SELL_EXTRA_JSON`** (merge object) without committing secrets.

---

## Production checklist

- Deploy (e.g. Vercel) and set env vars server-side.
- Replace `src/lib/db.ts` with a real database.
- Implement **real BOLT11** issuance + **settlement →** `POST /api/webhooks/lightning-payment` with **`LIGHTNING_WEBHOOK_SECRET`**.
- Restrict **`CDN_WIDGET_ALLOW_ORIGIN`** if you do not want public `*` CORS on LNURL responses.

---

## Contributing

1. Prefer **CSS Modules** for new UI; avoid new CSS frameworks.
2. Branches: `main` stable; `feature/...` for work.
3. PRs: clear message; if you touch LNURL, reference the relevant **LUD** / **BOLT** specs.

---

## Deliverables (mentors)

All submission links are centralized in **[DELIVERABLE.MD](./DELIVERABLE.MD)** (GitHub, demo, video placeholder, resources).

---

*Plan B Dev Track — programmable Bitcoin utility for Francophone West Africa.*
