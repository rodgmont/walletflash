import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flash — Lightning, Mobile Money y checkout',
  description:
    'Wallet web: Lightning Address (LNURL), venta de sats vía API Flash, widget para comercios y onboarding.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}
