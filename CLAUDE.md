# CLAUDE.md — Walletflash / Plan B Dev Track

Instructions for AI coding assistants working in this repository.

## Product context

- **Flash**: Lightning + mobile money in West Africa. This repo is a Next.js layer that demonstrates **Lightning Address / LNURL-pay (LUD-16)**, a **server-side proxy** to Flash's **sell** flow (`POST /transactions/create`), a **CDN widget** for merchants, and a **guided onboarding**.
- **Note**: real BOLT11 invoice generation and Lightning payment acknowledgement from a node are **not included** as a hosted service. The code provides the `POST /api/webhooks/lightning-payment` hook for a node or provider to call when an invoice settles.

## Implementation rules

1. **UI styles**: prefer **CSS Modules** (`*.module.css`) for new pages; reuse tokens and global classes (`btn-primary`, `card`, etc.) from `globals.css`.
2. **Secrets**: never expose `FLASH_API_SECRET`, `FLASH_STAGING_USER_ID`, or `LIGHTNING_WEBHOOK_SECRET` to the client — server route handlers only.
3. **Persistence**: `db.ts` uses an in-memory `Map` (Vercel-compatible). For production, replace with a real database.
4. **Flash API**: align request body with [docs.bitcoinflash.xyz](https://docs.bitcoinflash.xyz). Use `FLASH_XOF_PER_SAT` to tune the sats→XOF conversion rate.
5. **Next.js**: this project uses **Next 16** (App Router). Respect deprecation notices in the bundled Next.js docs when updating dependencies.

## File map

| Route | Role |
|-------|------|
| `src/app/.well-known/lnurlp/[username]/route.ts` | LNURL-pay metadata (LUD-16) |
| `src/app/api/lnurl/callback/[username]/route.ts` | LNURL callback (simulated invoice in demo) |
| `src/app/api/sell/route.ts` | Sell proxy → Flash or simulated mode |
| `src/app/api/webhooks/lightning-payment/route.ts` | Production webhook: node → sell |
| `src/lib/execute-sell.ts` | Shared sell logic |
| `src/lib/db.ts` | In-memory user store |
| `public/flash-checkout.js` | Merchant checkout widget |
| `public/demo.html` | Widget demo page |

## Skills used

Cursor Agent skills were used during development for rule creation, UI iteration, and API alignment. See [AGENTS.md](./AGENTS.md) for project conventions.
