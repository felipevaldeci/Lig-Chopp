import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lig Chopp Germânia — Sistema de Orçamentos',
  description: 'Sistema interno de orçamentos para vendedores da Central Lig Chopp Germânia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/vlr1ohk.css" />
        <link rel="stylesheet" href="https://use.typekit.net/yzj3pit.css" />
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  )
}
