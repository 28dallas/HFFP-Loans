import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

function getTitle(pathname) {
  if (pathname === '/') return 'Dashboard'
  if (pathname === '/members') return 'Members'
  if (pathname.startsWith('/users/')) return 'Member Profile'
  return 'HFFP'
}

export function TopBar() {
  const { pathname } = useLocation()

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-sm font-semibold text-text">{getTitle(pathname)}</h1>
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-muted hover:text-text hover:bg-slate-100 transition-colors relative">
          <Bell size={17} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-semibold">AD</span>
        </div>
      </div>
    </header>
  )
}
