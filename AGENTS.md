<!-- BEGIN:nextjs-agent-rules -->
# Next.js en este repo

Esta versión puede diferir de patrones antiguos. Antes de cambiar rutas o APIs de Next, revisa la guía en `node_modules/next/dist/docs/` y los avisos de deprecación.

# Reglas del proyecto walletflash

- **CSS**: nuevas vistas → **CSS Modules**; reutiliza tokens y clases globales (`btn-primary`, `glass-panel`, etc.).
- **LNURL / Lightning**: no simules pagos reales en producción; documenta el modo demo y el webhook `LIGHTNING_WEBHOOK_SECRET`.
- **Datos**: `data.json` es local y está en `.gitignore`; no commitear datos personales.
- **Integración Flash**: validar payloads con [docs.bitcoinflash.xyz](https://docs.bitcoinflash.xyz); usar `.env.example` como contrato de configuración.
<!-- END:nextjs-agent-rules -->
