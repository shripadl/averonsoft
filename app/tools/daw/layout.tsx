import { Inter } from 'next/font/google'
import './daw-theme.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-daw',
  display: 'swap',
})

export default function DAWLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} daw-workspace min-h-screen flex flex-col`}>
      {children}
    </div>
  )
}
