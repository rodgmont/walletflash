# Plan B Dev Track — Deliverables

All official project links for mentor review.

## 1. Open Source Repository (GitHub)

- **Repository**: [rodgmont/walletflash — Bitcoin Lightning wallet with auto-conversion to mobile money (MTN MoMo, Moov Money) built on Flash API — Plan B Dev Track Assignment](https://github.com/rodgmont/walletflash)

## 2. Documentation

- **Main README**: [README.md](./README.md) — scope, architecture, tech stack, environment variables, local onboarding and contribution guide.
- **AI agent instructions**: [CLAUDE.md](./CLAUDE.md) and [AGENTS.md](./AGENTS.md) (Next.js / project conventions).
- **This index**: [DELIVERABLE.MD](./DELIVERABLE.MD).

## 3. Live Demo

- **App (onboarding + dashboard)**: [https://walletflash.vercel.app](https://walletflash.vercel.app)
- **Merchant widget (SDK demo)**: [https://walletflash.vercel.app/demo.html](https://walletflash.vercel.app/demo.html)
- **CDN script**: [https://walletflash.vercel.app/flash-checkout.js](https://walletflash.vercel.app/flash-checkout.js)

## 4. Local Demo (always available)

```bash
npm install
cp .env.example .env.local   # set FLASH_API_SECRET if you have Flash credentials
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Merchant widget: [http://localhost:3000/demo.html](http://localhost:3000/demo.html)
- CDN script (served by the same app): [http://localhost:3000/flash-checkout.js](http://localhost:3000/flash-checkout.js)

## 5. Video Presentation

- **Demo (30s–1min)**: [https://youtu.be/O-mtkt1YOQ0](https://youtu.be/O-mtkt1YOQ0)

## 6. Brief Resources

- Flash docs: [https://docs.bitcoinflash.xyz](https://docs.bitcoinflash.xyz)
- Flash web: [https://bitcoinflash.xyz](https://bitcoinflash.xyz)
- Lightning Address: [https://lightningaddress.com/](https://lightningaddress.com/)
- BOLT: [https://github.com/lightning/bolts](https://github.com/lightning/bolts)

## 7. Mentor Contact (brief)

- Telegram: [@maurientz](https://t.me/maurientz)
- Email: olaniranlaurent@bitcoinflash.xyz
