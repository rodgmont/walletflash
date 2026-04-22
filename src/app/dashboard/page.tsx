'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TransactionLogEntry, UserProfile } from '@/types/user';
import styles from './dashboard.module.css';

type SellApiResponse = {
  success?: boolean;
  satsProcessed?: number;
  fiatAmount?: number;
  error?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactionLog, setTransactionLog] = useState<TransactionLogEntry[]>([]);

  const totalSats = useMemo(
    () => transactionLog.reduce((acc, tx) => acc + (typeof tx.amount === 'number' ? tx.amount : 0), 0),
    [transactionLog],
  );
  const totalFiat = useMemo(
    () => transactionLog.reduce((acc, tx) => acc + (typeof tx.fiat === 'number' ? tx.fiat : 0), 0),
    [transactionLog],
  );

  const loadUser = useCallback(async () => {
    const un = localStorage.getItem('currentUser');
    if (!un) { router.push('/'); return; }
    try {
      const res = await fetch(`/api/user?username=${encodeURIComponent(un)}`);
      const data: unknown = await res.json();
      const record = typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {};
      if (record.success === true && typeof record.user === 'object' && record.user !== null) {
        setUser(record.user as UserProfile);
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const t = window.setTimeout(() => { void loadUser(); }, 0);
    return () => window.clearTimeout(t);
  }, [loadUser]);

  const handleTestCallback = async () => {
    if (!user) return;
    setLoading(true);
    const amountMsats = 5_000_000;
    try {
      await fetch(`/.well-known/lnurlp/${encodeURIComponent(user.username)}`);
      const invRes = await fetch(
        `/api/lnurl/callback/${encodeURIComponent(user.username)}?amount=${amountMsats}`,
      );
      const invData: unknown = await invRes.json();
      const invRecord = typeof invData === 'object' && invData !== null
        ? (invData as Record<string, unknown>)
        : {};
      if (typeof invRecord.pr === 'string') {
        const flashRes = await fetch('/api/sell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sats: amountMsats / 1000, username: user.username }),
        });
        const data = (await flashRes.json()) as SellApiResponse;
        if (data.success) {
          setTransactionLog((prev) => [
            {
              id: Math.random().toString(36).slice(2, 11),
              amount: data.satsProcessed ?? amountMsats / 1000,
              fiat: data.fiatAmount ?? 0,
              provider: user.provider,
              status: 'LNURL → sell (Flash API)',
            },
            ...prev,
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <span>⚡</span> Cargando perfil…
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <p className={styles.greeting}>Bienvenido de vuelta</p>
          <h2>
            <span className={styles.titleAccent}>⚡ {user.username}</span>
            <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>@flash.xyz</span>
          </h2>
        </div>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            localStorage.removeItem('currentUser');
            router.push('/');
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiStrip}>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>⚡</span>
          <span className={styles.kpiLabel}>Sats procesados</span>
          <div>
            <span className={styles.kpiValue}>{totalSats.toLocaleString()}</span>
            <span className={styles.kpiUnit}>sats</span>
          </div>
          <span className={styles.kpiSub}>esta sesión</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>💸</span>
          <span className={styles.kpiLabel}>Fiat depositado</span>
          <div>
            <span className={styles.kpiValue}>{totalFiat.toLocaleString()}</span>
            <span className={styles.kpiUnit}>FCFA</span>
          </div>
          <span className={styles.kpiSub}>{user.provider}</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>📊</span>
          <span className={styles.kpiLabel}>Operaciones</span>
          <div>
            <span className={styles.kpiValue}>{transactionLog.length}</span>
          </div>
          <span className={styles.kpiSub}>liquidaciones demo</span>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>

        {/* CTA */}
        <div className={`card ${styles.card} ${styles.ctaCard}`}>
          <p className={styles.cardTitle}>
            <span className={styles.cardTitleDot} />
            Simular pago Lightning
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: 20 }}>
            Ejecuta el flujo completo: LNURL-pay → callback → sell → depósito MoMo.
          </p>
          <button
            type="button"
            className={`btn-primary ${styles.fullWidth}`}
            onClick={() => void handleTestCallback()}
            disabled={loading}
          >
            {loading ? '⚡ Procesando…' : '⚡ Procesar 5.000 sats'}
          </button>
          <p className={styles.ctaHint}>
            En producción, el nodo Lightning notifica{' '}
            <code>/api/webhooks/lightning-payment</code> al recibir el pago real.
          </p>
        </div>

        {/* Config */}
        <div className={`card ${styles.card}`}>
          <p className={styles.cardTitle}>
            <span className={styles.cardTitleDot} />
            Configuración
          </p>

          <div className={styles.configRow}>
            <span className={styles.configLabel}>Lightning Address</span>
            <span className={styles.configValue}>
              ⚡ {user.username}@flash.xyz
            </span>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Auto-conversión</span>
            <span className={`${styles.pill}`}>✓ 100%</span>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Operador</span>
            <div className={styles.configValue}>
              {user.provider}
              <div className={styles.configMuted}>{user.mobileNumber}</div>
            </div>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Min / Max recibible</span>
            <span className={styles.configValue} style={{ color: 'var(--text-3)', fontWeight: 500 }}>
              {((user.lnurlConfig?.minSendable ?? 1000) / 1000).toLocaleString()} –{' '}
              {((user.lnurlConfig?.maxSendable ?? 100_000_000) / 1000).toLocaleString()} sats
            </span>
          </div>
        </div>
      </div>

      {/* Log */}
      <div className={`card ${styles.logSection}`}>
        <div className={styles.logHeader}>
          <p className={styles.cardTitle} style={{ margin: 0 }}>
            <span className={styles.cardTitleDot} />
            Registro de operaciones
          </p>
          {transactionLog.length > 0 && (
            <span className={styles.logCount}>{transactionLog.length} liquidaciones</span>
          )}
        </div>

        {transactionLog.length === 0 ? (
          <div className={styles.emptyLog}>
            <div className={styles.emptyLogIcon}>📭</div>
            <p>Sin liquidaciones en esta sesión.<br />Presiona el botón de arriba para simular.</p>
          </div>
        ) : (
          <div className={styles.logList}>
            {transactionLog.map((tx) => (
              <div key={tx.id} className={styles.logItem}>
                <div className={styles.logLeft}>
                  <div className={styles.logBullet}>⚡</div>
                  <div>
                    <div className={styles.logSats}>{tx.amount.toLocaleString()} sats</div>
                    <div className={styles.logStatus}>{tx.status}</div>
                  </div>
                </div>
                <div className={styles.logRight}>
                  <div className={styles.logFiat}>+{tx.fiat.toLocaleString()} FCFA</div>
                  <div className={styles.logProvider}>{tx.provider}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
