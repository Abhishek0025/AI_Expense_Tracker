import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import QueryProvider from '@/lib/providers/QueryProvider'
import { ToastProvider } from '@/lib/providers/ToastProvider'
import SessionProvider from '@/lib/providers/SessionProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Expense Tracker',
  description: 'Track your expenses with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="relative font-sans">
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <ToastProvider>
                <div className="relative z-10">
                  <Navigation />
                  {children}
                </div>
              </ToastProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

