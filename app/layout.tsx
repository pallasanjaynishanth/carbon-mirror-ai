import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/layout/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CarbonMirror AI — See The Hidden Impact Of Your Everyday Choices',
    template: '%s | CarbonMirror AI',
  },
  description:
    'Understand how your everyday actions affect the planet through stories, simulations, visual consequences, and social engagement. Not a carbon calculator — a behavioral change engine.',
  keywords: ['carbon footprint', 'sustainability', 'climate change', 'carbon awareness', 'eco tracker'],
  authors: [{ name: 'CarbonMirror Team' }],
  openGraph: {
    type: 'website',
    title: 'CarbonMirror AI',
    description: 'See The Hidden Impact Of Your Everyday Choices.',
    siteName: 'CarbonMirror AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CarbonMirror AI',
    description: 'See The Hidden Impact Of Your Everyday Choices.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
