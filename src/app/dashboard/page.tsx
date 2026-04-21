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

  const sessionSats = useMemo(
    () => transactionLog.reduce((acc, tx) => acc + (typeof tx.amount === 'number' ? tx.amount : 0), 0),
    [transactionLog],
  );

  const loadUser = useCallback(async () => {
    const un = localStorage.getItem('currentUser');
    if (!un) {
      router.push('/');
      return;
    }
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
    const t = window.setTimeout(() => {
      void loadUser();
    }, 0);
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
      const invRecord = typeof invData === 'object' && invData !== null ? (invData as Record<string, unknown>) : {};

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
              status: 'Liquidación demo → sell (Flash API o simulado)',
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
    return <div className={styles.loading}>Cargando perfil…</div>;
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.topBar}>
        <h2>
          Flash <span className={styles.titleAccent}>Wallet</span>
        </h2>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            localStorage.removeItem('currentUser');
            router.push('/');
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <div className={styles.grid}>
        <div className={`glass-panel ${styles.card}`}>
          <p className={styles.labelMuted}>Sats procesados en esta sesión (demo)</p>
          <h1 className={styles.balance}>
            {sessionSats.toLocaleString()} <span className={styles.balanceUnit}>sats</span>
          </h1>

          <button
            type="button"
            className={`btn-primary ${styles.fullWidth}`}
            onClick={() => void handleTestCallback()}
            disabled={loading}
          >
            {loading ? 'Procesando…' : 'Simular cobro LNURL + sell'}
          </button>
          <p className={styles.labelMuted} style={{ marginTop: 16 }}>
            En producción, el nodo o proveedor LN llamaría a{' '}
            <code>/api/webhooks/lightning-payment</code> con el secreto configurado.
          </p>
        </div>

        <div className={`glass-panel ${styles.card}`}>
          <h3 style={{ marginBottom: 24 }}>Configuración</h3>

          <div className={styles.row}>
            <span className={styles.labelMuted}>Lightning Address</span>
            <strong>
              {user.username}@flash.xyz
            </strong>
          </div>

          <div className={styles.row}>
            <span className={styles.labelMuted}>Límite auto-conversión</span>
            <strong style={{ color: 'var(--secondary)' }}>{user.autoConvertLimit}%</strong>
          </div>

          <div className={styles.row}>
            <span className={styles.labelMuted}>Mobile Money</span>
            <div className={styles.rowRight}>
              <strong>{user.provider}</strong>
              <br />
              <span className={styles.labelMuted} style={{ fontSize: '0.85em' }}>
                {user.mobileNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={`glass-panel ${styles.logSection}`}>
        <h3 className={styles.logTitle}>Registro de operaciones</h3>
        {transactionLog.length === 0 ? (
          <p className={styles.emptyLog}>Aún no hay liquidaciones demo en esta sesión.</p>
        ) : (
          <div className={styles.logList}>
            {transactionLog.map((tx) => (
              <div key={tx.id} className={styles.logItem}>
                <div>
                  <strong>{tx.amount} sats</strong>
                  <div className={styles.logStatus}>{tx.status}</div>
                </div>
                <div className={styles.logFiat}>
                  <strong>+{tx.fiat} FCFA</strong>
                  <div className={styles.logFiatNote}>{tx.provider}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
