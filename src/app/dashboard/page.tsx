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
        <span>⚡</span> Loading profile…
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <p className={styles.greeting}>Welcome back</p>
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
          Sign out
        </button>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiStrip}>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>⚡</span>
          <span className={styles.kpiLabel}>Sats processed</span>
          <div>
            <span className={styles.kpiValue}>{totalSats.toLocaleString()}</span>
            <span className={styles.kpiUnit}>sats</span>
          </div>
          <span className={styles.kpiSub}>this session</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>💸</span>
          <span className={styles.kpiLabel}>Fiat deposited</span>
          <div>
            <span className={styles.kpiValue}>{totalFiat.toLocaleString()}</span>
            <span className={styles.kpiUnit}>XOF</span>
          </div>
          <span className={styles.kpiSub}>{user.provider}</span>
        </div>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiIcon}>📊</span>
          <span className={styles.kpiLabel}>Transactions</span>
          <div>
            <span className={styles.kpiValue}>{transactionLog.length}</span>
          </div>
          <span className={styles.kpiSub}>demo settlements</span>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>

        {/* CTA */}
        <div className={`card ${styles.card} ${styles.ctaCard}`}>
          <p className={styles.cardTitle}>
            <span className={styles.cardTitleDot} />
            Simulate Lightning payment
          </p>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: 20 }}>
            Run the full flow: LNURL-pay → callback → sell → MoMo deposit.
          </p>
          <button
            type="button"
            className={`btn-primary ${styles.fullWidth}`}
            onClick={() => void handleTestCallback()}
            disabled={loading}
          >
            {loading ? '⚡ Processing…' : '⚡ Process 5,000 sats'}
          </button>
          <p className={styles.ctaHint}>
            In production, the Lightning node notifies{' '}
            <code>/api/webhooks/lightning-payment</code> when a real payment settles.
          </p>
        </div>

        {/* Config */}
        <div className={`card ${styles.card}`}>
          <p className={styles.cardTitle}>
            <span className={styles.cardTitleDot} />
            Configuration
          </p>

          <div className={styles.configRow}>
            <span className={styles.configLabel}>Lightning Address</span>
            <span className={styles.configValue}>
              ⚡ {user.username}@flash.xyz
            </span>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Auto-conversion</span>
            <span className={styles.pill}>✓ 100%</span>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Operator</span>
            <div className={styles.configValue}>
              {user.provider}
              <div className={styles.configMuted}>{user.mobileNumber}</div>
            </div>
          </div>
          <div className={styles.configRow}>
            <span className={styles.configLabel}>Min / Max receivable</span>
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
            Transaction log
          </p>
          {transactionLog.length > 0 && (
            <span className={styles.logCount}>{transactionLog.length} settlements</span>
          )}
        </div>

        {transactionLog.length === 0 ? (
          <div className={styles.emptyLog}>
            <div className={styles.emptyLogIcon}>📭</div>
            <p>No settlements in this session.<br />Press the button above to simulate.</p>
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
                  <div className={styles.logFiat}>+{tx.fiat.toLocaleString()} XOF</div>
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
