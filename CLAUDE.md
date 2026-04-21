# CLAUDE.md — Walletflash / Plan B Dev Track

Instrucciones para asistentes de código que trabajen en este repositorio.

## Contexto del producto

- **Flash**: Lightning + mobile money en África Occidental; este repo es una capa web (Next.js) que demuestra **Lightning Address / LNURL-pay (LUD-16)**, un **proxy seguro** hacia el endpoint de **venta (sell)** de la API Flash, un **widget CDN** para comercios y un **onboarding** guiado.
- **Importante**: la generación de facturas BOLT11 reales y el acuse de pago desde un nodo Lightning **no están incluidos** como servicio alojado: el código deja el gancho `POST /api/webhooks/lightning-payment` para que un nodo o proveedor notifique cuando un cobro se liquide.

## Reglas de implementación

1. **Estilos de UI**: preferir **CSS Modules** (`*.module.css`) para páginas nuevas; mantener coherencia con `globals.css` (tokens, botones, glass).
2. **Secretos**: nunca exponer `FLASH_API_SECRET` ni `LIGHTNING_WEBHOOK_SECRET` al cliente; solo uso en **route handlers** servidor.
3. **Persistencia**: `data.json` está **ignorado por git**; en local se crea al registrar usuarios. Para producción, sustituir `src/lib/db.ts` por una base real.
4. **API Flash**: el cuerpo exacto de `POST /transactions/sell` debe alinearse con la documentación oficial. Si difiere, usar `FLASH_SELL_EXTRA_JSON` (ver `.env.example`) sin hardcodear credenciales.
5. **Next.js**: esta plantilla usa **Next 16** (App Router). Respeta avisos de deprecación en la documentación empaquetada de Next si actualizas dependencias.

## Mapa útil

| Ruta | Rol |
|------|-----|
| `src/app/.well-known/lnurlp/[username]/route.ts` | Metadatos LNURL-pay |
| `src/app/api/lnurl/callback/[username]/route.ts` | Callback (invoice simulada en demo) |
| `src/app/api/sell/route.ts` | Proxy sell → Flash o modo simulado |
| `src/app/api/webhooks/lightning-payment/route.ts` | Webhook servidor→sell |
| `src/lib/execute-sell.ts` | Lógica compartida de venta |
| `public/flash-checkout.js` | Widget para comercios |
| `public/demo.html` | Página demo del widget |

## Skills / agentes usados (referencia)

Durante el desarrollo se pueden usar skills de Cursor (p. ej. estándares de reglas o despliegue) según el flujo del equipo; no es obligatorio listar versiones aquí. Mantén este archivo actualizado si cambia la arquitectura o los límites de la demo.
