'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [handle, setHandle] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [provider, setProvider] = useState('MTN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setError(null);
    if (step === 1) {
      const h = handle.trim().toLowerCase();
      if (!/^[a-z0-9._-]{2,32}$/.test(h)) {
        setError('Usa 2–32 caracteres: letras minúsculas, números, . _ -');
        return;
      }
    }
    if (step === 2) {
      const digits = mobileNumber.replace(/\D/g, '');
      if (digits.length < 8) {
        setError('Introduce un número móvil válido (mín. 8 dígitos).');
        return;
      }
    }

    if (step < 3) {
      if (step === 2) {
        setLoading(true);
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: handle.trim().toLowerCase(),
            provider,
            mobileNumber,
            autoConvertLimit: 100,
          }),
        });
        const data: unknown = await res.json().catch(() => null);
        const ok = typeof data === 'object' && data !== null && (data as { success?: boolean }).success === true;
        setLoading(false);
        if (!ok) {
          const msg =
            typeof data === 'object' && data !== null && typeof (data as { error?: string }).error === 'string'
              ? (data as { error: string }).error
              : 'No se pudo registrar. Reintenta.';
          setError(msg);
          return;
        }
        localStorage.setItem('currentUser', handle.trim().toLowerCase());
      }
      setStep(step + 1);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={`glass-panel animate-fade-up ${styles.panel}`}>
        <div className={styles.hero}>
          <h1 className={styles.title}>Flash Wallet & LN</h1>
          <p className={styles.subtitle}>
            Lightning + Mobile Money para África Occidental. Configura tu alias y el destino MoMo para
            auto-conversión vía Flash API.
          </p>
        </div>

        {step === 1 && (
          <div className="animate-fade-up">
            <h3 className={styles.stepTitle}>Paso 1: tu Lightning Address</h3>
            <p className={styles.stepLead}>
              Es como un correo: la gente envía sats a <strong>tualias@flash.xyz</strong> (dominio de marca en esta
              demo; la resolución LNURL vive en esta app).
            </p>
            <div className="input-group">
              <label className="input-label" htmlFor="handle">
                Elige tu alias
              </label>
              <div className={styles.handleRow}>
                <input
                  id="handle"
                  type="text"
                  className="input-field"
                  placeholder="p. ej. kofi"
                  autoComplete="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                />
                <div className={styles.suffix}>@flash.xyz</div>
              </div>
              {error ? <p className={styles.error}>{error}</p> : null}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-up">
            <h3 className={styles.stepTitle}>Paso 2: Mobile Money</h3>
            <p className={styles.stepLead}>
              Cuando se liquide un cobro Lightning hacia tu alias, el flujo de negocio dispara la venta de sats vía
              Flash (endpoint <code>sell</code>) hacia este número.
            </p>
            <div className="input-group">
              <label className="input-label" htmlFor="provider">
                Proveedor
              </label>
              <select
                id="provider"
                className="input-field"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="MTN">MTN MoMo</option>
                <option value="MOOV">Moov Money</option>
                <option value="CELTIIS">Celtiis</option>
                <option value="TOGOCEL">Togocel</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="mobile">
                Número móvil
              </label>
              <input
                id="mobile"
                type="tel"
                className="input-field"
                placeholder="+229 XX XX XX XX"
                inputMode="tel"
                autoComplete="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
              {error ? <p className={styles.error}>{error}</p> : null}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-up">
            <h3 className={`${styles.stepTitle} ${styles.successTitle}`}>¡Listo!</h3>
            <p className={styles.stepLead}>
              Tu ruta está registrada en el almacén local de la app. Cualquier pago negociado vía LNURL hacia{' '}
              <strong>
                {handle.trim().toLowerCase()}@flash.xyz
              </strong>{' '}
              debe, en producción, enlazar con tu nodo Lightning y luego ejecutar el <strong>sell</strong> en Flash
              hacia {provider} ({mobileNumber}).
            </p>
            <div className={styles.hintBox}>
              <span className={styles.hintStrong}>
                Auto-conversión configurada: <strong>100%</strong>
              </span>
            </div>
            <p className={styles.stepLead}>
              Siguiente: en el panel prueba el flujo demo o conecta tu <code>FLASH_API_SECRET</code> para ventas
              reales.
            </p>
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep(step - 1)}>
              Atrás
            </button>
          ) : (
            <div className={styles.actionsSpacer} />
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={handleNext}
            disabled={loading || (step === 1 && !handle.trim())}
          >
            {loading ? 'Guardando…' : step === 3 ? 'Ir al panel' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}
