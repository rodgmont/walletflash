import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Flash — Lightning, Mobile Money y checkout',
  description:
    'Wallet web: Lightning Address (LNURL), venta de sats vía API Flash, widget para comercios y onboarding.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className={styles.nav}>
          <div className={`container ${styles.navInner}`}>
            <Link href="/" className={styles.brand} aria-label="Flash — inicio">
              <span className={styles.brandIcon}>⚡</span>
              <span className={styles.brandName}>Flash</span>
            </Link>
            <nav className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Wallet</Link>
              <a href="/demo.html" className={styles.navLink}>SDK Demo</a>
              <a
                href="https://docs.bitcoinflash.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navLink}
              >
                Docs
              </a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className={styles.footer}>
          <div className={`container ${styles.footerInner}`}>
            <span>© 2025 Flash · Plan B Dev Track</span>
            <span>
              <a
                href="https://bitcoinflash.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footerLink}
              >
                bitcoinflash.xyz
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
