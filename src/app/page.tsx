'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const STEPS = [
  { label: 'Alias' },
  { label: 'Mobile Money' },
  { label: 'Listo' },
];

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
      const ok =
        typeof data === 'object' && data !== null && (data as { success?: boolean }).success === true;
      setLoading(false);
      if (!ok) {
        const msg =
          typeof data === 'object' &&
          data !== null &&
          typeof (data as { error?: string }).error === 'string'
            ? (data as { error: string }).error
            : 'No se pudo registrar. Reintenta.';
        setError(msg);
        return;
      }
      localStorage.setItem('currentUser', handle.trim().toLowerCase());
    }

    if (step < 3) setStep(step + 1);
    else router.push('/dashboard');
  };

  return (
    <div className={styles.wrap}>

      {/* Step indicator */}
      <div className={`${styles.steps} animate-fade-up`}>
        {STEPS.map((s, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <React.Fragment key={s.label}>
              <div className={styles.step}>
                <div
                  className={[
                    styles.stepDot,
                    active ? styles.stepDotActive : '',
                    done ? styles.stepDotDone : '',
                  ].join(' ')}
                >
                  {done ? '✓' : n}
                </div>
                <span className={`${styles.stepLabel} ${active ? styles.stepLabelActive : ''}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Main card */}
      <div className={`card card-glow ${styles.panel} animate-fade-up-2`}>

        {step === 1 && (
          <div>
            <p className="badge" style={{ marginBottom: 20 }}>⚡ Lightning Address</p>
            <h2 className={styles.stepHeading}>
              Crea tu <span className={styles.stepAccent}>alias</span>
            </h2>
            <p className={styles.stepLead}>
              Es como un correo pero para Bitcoin. Cualquier cartera Lightning puede
              enviarte sats a <strong style={{ color: 'var(--text-2)' }}>tualias@flash.xyz</strong> al instante.
            </p>

            <div className="input-group">
              <label className="input-label" htmlFor="handle">Tu alias</label>
              <div className={styles.handleRow}>
                <input
                  id="handle"
                  type="text"
                  className="input-field"
                  placeholder="kofi"
                  autoComplete="username"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void handleNext()}
                />
                <div className={styles.suffix}>@flash.xyz</div>
              </div>
              {error && <p className={styles.errorMsg}>⚠ {error}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="badge" style={{ marginBottom: 20 }}>📱 Mobile Money</p>
            <h2 className={styles.stepHeading}>
              Vincula tu <span className={styles.stepAccent}>MoMo</span>
            </h2>
            <p className={styles.stepLead}>
              Los sats recibidos se convierten automáticamente a FCFA y se
              depositan en este número vía Flash API.
            </p>

            <div className="input-group">
              <label className="input-label" htmlFor="provider">Operador</label>
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
              <label className="input-label" htmlFor="mobile">Número</label>
              <input
                id="mobile"
                type="tel"
                className="input-field"
                placeholder="+229 XX XX XX XX"
                inputMode="tel"
                autoComplete="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void handleNext()}
              />
              {error && <p className={styles.errorMsg}>⚠ {error}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.stepHeading}>
              <span className={styles.stepAccent}>¡Todo listo!</span>
            </h2>
            <p className={styles.stepLead}>
              Tu Lightning Address está activa y el pipeline de auto-conversión
              está configurado.
            </p>

            <div className={styles.addressPill}>
              <span className={styles.addressPillIcon}>⚡</span>
              <span className={styles.addressPillText}>
                {handle.trim().toLowerCase()}@flash.xyz
              </span>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Operador</span>
                <span className={styles.infoValue}>{provider}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Número</span>
                <span className={styles.infoValue}>{mobileNumber}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Auto-conversión</span>
                <span className={styles.infoValue} style={{ color: 'var(--success)' }}>100%</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {step > 1 ? (
            <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>
              ← Atrás
            </button>
          ) : (
            <div className={styles.spacer} />
          )}

          <button
            type="button"
            className={`btn-primary ${step === 3 ? styles.btnFullWidth : ''}`}
            style={step !== 3 ? undefined : { marginTop: 0 }}
            onClick={() => void handleNext()}
            disabled={loading || (step === 1 && !handle.trim())}
          >
            {loading
              ? 'Guardando…'
              : step === 3
              ? 'Ir al panel →'
              : step === 2
              ? 'Confirmar'
              : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  );
}
