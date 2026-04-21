(function () {
  const STYLES = `
    .flash-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 9999; font-family: 'Inter', sans-serif;
      opacity: 0; transition: opacity 0.3s ease; pointer-events: none;
    }
    .flash-modal-overlay.open { opacity: 1; pointer-events: auto; }
    .flash-modal-content {
      background: #17191e; width: 400px; border-radius: 20px;
      padding: 32px; color: #fff; box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      transform: translateY(20px); transition: transform 0.3s ease;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .flash-modal-overlay.open .flash-modal-content { transform: translateY(0); }
    .flash-btn {
      background: linear-gradient(135deg, #f7931a, #e67e22); padding: 12px 24px;
      border-radius: 12px; color: #000; font-weight: 600; border: none;
      cursor: pointer; display: inline-block; box-shadow: 0 4px 15px rgba(247,147,26,0.3);
    }
    .flash-btn-close {
      background: transparent; border: 1px solid #2a2e37; color: #8b92a5;
      padding: 8px 16px; border-radius: 8px; cursor: pointer; float: right;
    }
    .flash-qr-placeholder {
      width: 250px; height: 250px; background: #fff; margin: 24px auto;
      border-radius: 12px; display: flex; justify-content: center; align-items: center;
    }
    .flash-banner { font-size: 0.85rem; padding: 10px 12px; border-radius: 10px; margin-bottom: 12px; }
    .flash-banner.ok { background: rgba(44,151,75,0.15); border: 1px solid #2c974b; color: #b8f2c9; }
    .flash-banner.err { background: rgba(255,80,80,0.12); border: 1px solid #ff6b6b; color: #ffb4b4; }
  `;

  function scriptOrigin() {
    const el = document.currentScript;
    if (el && el.src) {
      try {
        return new URL(el.src).origin;
      } catch {
        /* fall through */
      }
    }
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i -= 1) {
      const s = scripts[i];
      if (s.src && /flash-checkout\.js/i.test(s.src)) {
        try {
          return new URL(s.src).origin;
        } catch {
          break;
        }
      }
    }
    return window.location.origin;
  }

  function parseLnAddress(address) {
    const trimmed = (address || '').trim();
    const at = trimmed.indexOf('@');
    if (at < 1) return { local: '', domain: '' };
    return { local: trimmed.slice(0, at).toLowerCase(), domain: trimmed.slice(at + 1) };
  }

  class FlashCheckout {
    constructor() {
      this.origin = scriptOrigin();
      this.init();
    }

    init() {
      const styleEl = document.createElement('style');
      styleEl.innerHTML = STYLES;
      document.head.appendChild(styleEl);

      this.overlay = document.createElement('div');
      this.overlay.className = 'flash-modal-overlay';

      this.modal = document.createElement('div');
      this.modal.className = 'flash-modal-content';

      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);

      document.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.hasAttribute && t.hasAttribute('data-flash-checkout')) {
          const sats = t.getAttribute('data-sats') || '5000';
          const address = t.getAttribute('data-address') || 'merchant@flash.xyz';
          this.open(sats, address);
        }
      });
    }

    async open(sats, address) {
      const { local, domain } = parseLnAddress(address);
      let banner = '';
      try {
        const url = `${this.origin}/.well-known/lnurlp/${encodeURIComponent(local)}`;
        const res = await fetch(url);
        if (res.ok) {
          const j = await res.json();
          if (j && j.tag === 'payRequest' && typeof j.callback === 'string') {
            banner =
              '<div class="flash-banner ok">LNURL-pay resuelto en esta app (LUD-16). Listo para cobrar con cartera Lightning.</div>';
          } else {
            banner =
              '<div class="flash-banner err">Respuesta LNURL inesperada. Revisa el usuario en la app Flash.</div>';
          }
        } else {
          banner = `<div class="flash-banner err">No se encontró LNURL para <strong>${local}</strong> (${res.status}). Regístralo primero en el onboarding.</div>`;
        }
      } catch {
        banner =
          '<div class="flash-banner err">No se pudo contactar la app Flash (CORS o URL). Asegúrate de cargar el script desde el mismo dominio desplegado.</div>';
      }

      const qrPayload = encodeURIComponent(`lightning:${address}`);
      this.modal.innerHTML = `
        <button type="button" class="flash-btn-close" aria-label="Cerrar">✕</button>
        <h2 style="margin-top:0; color: #f7931a;">Pagar con Lightning</h2>
        ${banner}
        <p style="color: #8b92a5;">Importe sugerido: <strong>${sats} sats</strong></p>
        <p style="color: #8b92a5;">Lightning Address:</p>
        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <strong style="color: #fff;">${address}</strong>
        </div>
        <p style="font-size: 0.8rem; color: #6f7688;">Origen de la app: <code>${this.origin}</code>${domain ? ` · dominio en address: <code>${domain}</code>` : ''}</p>
        <div class="flash-qr-placeholder">
          <img width="200" height="200" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrPayload}" alt="QR Lightning" />
        </div>
        <p style="text-align: center; font-size: 0.85rem; color: #8b92a5;">Tras el pago, tu backend Lightning debe notificar <code>/api/webhooks/lightning-payment</code> para ejecutar el sell vía Flash.</p>
      `;
      const closeBtn = this.modal.querySelector('.flash-btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.close());
      }
      this.overlay.classList.add('open');
    }

    close() {
      this.overlay.classList.remove('open');
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.FlashCheckout = new FlashCheckout();
  });
})();
