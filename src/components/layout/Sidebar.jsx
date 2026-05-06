import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, Landmark, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
]

export function Sidebar({ open = false, onClose = () => {} }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-950/40 z-30 transition-opacity duration-200 lg:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside className={`fixed left-0 top-0 h-screen w-60 bg-primary flex flex-col z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-white/10 lg:justify-start">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Landmark size={16} className="text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="text-white font-semibold text-sm leading-tight">HFFP</p>
            <p className="text-white/50 text-xs">Loan Management</p>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
