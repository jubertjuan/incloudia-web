import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IncloudIA | La nube que piensa contigo',
  description:
    'Infraestructura cloud inteligente, segura y flexible para operaciones que quieren avanzar.',
  metadataBase: new URL('https://incloudia-web.vercel.app'),
  generator: 'IncloudIA',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'IncloudIA | La nube que piensa contigo',
    description:
      'Infraestructura cloud inteligente, segura y flexible para operaciones que quieren avanzar.',
    url: 'https://incloudia-web.vercel.app',
    siteName: 'IncloudIA',
    images: [
      {
        url: '/og-incloudia.png',
        width: 1200,
        height: 630,
        alt: 'IncloudIA Consultora',
      },
    ],
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IncloudIA | La nube que piensa contigo',
    description:
      'Infraestructura cloud inteligente, segura y flexible para operaciones que quieren avanzar.',
    images: ['/og-incloudia.png'],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}