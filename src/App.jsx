import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { supabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import UserDetail from './pages/UserDetail'
import Members from './pages/Members'
import Login from './pages/Login'
import { PageSpinner } from './components/ui/Spinner'

function AuthGuard({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <PageSpinner />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/members"
            element={
              <AuthGuard>
                <Members />
              </AuthGuard>
            }
          />
          <Route
            path="/users/:id"
            element={
              <AuthGuard>
                <UserDetail />
              </AuthGuard>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
