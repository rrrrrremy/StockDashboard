// src/app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavLink from '../components/NavLink'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Stock Dashboard',
  description: 'Track AI companies and investment opportunities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen flex flex-col`}>
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-800">AI Stock Dashboard</h1>
              </div>
              <p className="text-sm text-gray-600">Intelligent Insights for Smart Investments</p>
            </div>
          </div>
        </header>

        <nav className="bg-blue-600">
          <div className="container mx-auto px-4">
            <div className="flex space-x-4">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/portfolio">My Portfolio</NavLink>
            </div>
          </div>
        </nav>

        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="bg-gray-800 text-white py-4 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 AI Stock Dashboard. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}