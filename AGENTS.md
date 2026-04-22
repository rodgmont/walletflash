<!-- BEGIN:nextjs-agent-rules -->
# Next.js in this repo

This version may differ from older patterns. Before changing routes or Next.js APIs, check the guide in `node_modules/next/dist/docs/` and respect deprecation notices.

# Walletflash project rules

- **CSS**: new views → **CSS Modules**; reuse tokens and global classes (`btn-primary`, `card`, etc.).
- **LNURL / Lightning**: do not simulate real payments in production; document demo mode and the `LIGHTNING_WEBHOOK_SECRET` webhook.
- **Data**: `db.ts` uses an in-memory Map (Vercel-compatible). For production replace with a real DB.
- **Flash API**: validate payloads against [docs.bitcoinflash.xyz](https://docs.bitcoinflash.xyz); use `.env.example` as the configuration contract.
- **Language**: all code, comments, and UI text must be written in **English**.
<!-- END:nextjs-agent-rules -->
