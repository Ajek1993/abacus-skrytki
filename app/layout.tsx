import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zarządzanie Skrytkami',
  description: 'Aplikacja do zarządzania kodami dostępu do skrytek',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
