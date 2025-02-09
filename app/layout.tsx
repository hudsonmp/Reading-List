import './globals.css'
import type { Metadata } from 'next'
import AuthProvider from './providers/AuthProvider'
import React from 'react'

export const metadata: Metadata = {
  title: 'Reading List',
  description: 'Keep track of your reading materials',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
} 