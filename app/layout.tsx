import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JelantahGO - Sistem Manajemen Pengumpulan Minyak Jelantah',
  description: 'Platform digital untuk pengelolaan bisnis pengumpulan minyak jelantah',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  )
}
