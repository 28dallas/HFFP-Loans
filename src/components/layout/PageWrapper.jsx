import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function PageWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
    setDesktopSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <div
        className="hidden lg:block fixed left-0 top-0 h-screen w-5 z-50"
        onMouseEnter={() => setDesktopSidebarOpen(true)}
        aria-hidden="true"
      />
      <Sidebar
        open={sidebarOpen}
        desktopOpen={desktopSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDesktopOpenChange={setDesktopSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-16">
        <TopBar onMobileMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
