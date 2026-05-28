'use client'

import Link from 'next/link'
import { X, LogOut } from 'lucide-react'
import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute inset-y-0 right-0 w-64 bg-card border-l border-border shadow-lg rounded-l-xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <Link
              href="/about"
              onClick={onClose}
              className="block px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-foreground"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="block px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-foreground"
            >
              Contact
            </Link>
            <Link
              href="/properties"
              onClick={onClose}
              className="block px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-foreground"
            >
              Properties
            </Link>
            
            <Link
              href="/settings"
              onClick={onClose}
              className="block px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-foreground"
            >
              Settings
            </Link>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
