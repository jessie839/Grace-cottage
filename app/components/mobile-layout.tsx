'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Upload, Image, Settings, User, Menu } from 'lucide-react'
import { useState } from 'react'
import { MobileMenu } from './mobile-menu'

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Gallery', path: '/gallery', icon: Image },
    { label: 'Upload', path: '/upload', icon: Upload },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Menu', icon: Menu, onClick: () => setMenuOpen(true) },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {children}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-3 md:hidden">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                </button>
              )
            }
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-secondary/50 text-foreground'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Padding for bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
