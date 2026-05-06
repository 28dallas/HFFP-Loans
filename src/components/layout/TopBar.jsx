import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getInitials } from '../../lib/utils'

function getTitle(pathname) {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/members') return 'Members'
  if (pathname.startsWith('/users/')) return 'Member Profile'
  return 'HFFP'
}

export function TopBar({ onMobileMenu = () => {} }) {
  const { pathname } = useLocation()
  const [initials, setInitials] = useState('AD')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data?.session?.user
      if (user) {
        const name = user.user_metadata?.full_name || user.email || ''
        setInitials(getInitials(name) || 'AD')
      }
    })
  }, [])

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenu}
          className="lg:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="text-sm font-semibold text-text">{getTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-muted hover:text-text hover:bg-slate-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={17} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
          {initials}
        </div>
      </div>
    </header>
  )
}
