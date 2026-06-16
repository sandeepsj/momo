import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PetProvider } from '@/context/PetProvider'
import { ThemeProvider } from '@/context/ThemeProvider'
import Login from '@/components/Login'
import Layout from '@/components/Layout'
import PetList from '@/pages/PetList'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Medical from '@/pages/Medical'
import Prescriptions from '@/pages/Prescriptions'
import Reminders from '@/pages/Reminders'

export default function App() {
  const { auth, loading, error, login, logout, expire } = useAuth()

  return (
    <ThemeProvider>
      {!auth ? (
        <Login onLogin={login} loading={loading} error={error} />
      ) : (
        <PetProvider auth={auth} onExpire={expire} onLogout={logout}>
          <Routes>
            <Route path="/" element={<PetList />} />
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/medical" element={<Medical />} />
              <Route path="/prescriptions" element={<Prescriptions />} />
              <Route path="/reminders" element={<Reminders />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PetProvider>
      )}
    </ThemeProvider>
  )
}
