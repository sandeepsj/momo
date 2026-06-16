import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PetProvider } from '@/context/PetProvider'
import Login from '@/components/Login'
import Layout from '@/components/Layout'
import PetList from '@/pages/PetList'
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Events from '@/pages/Events'
import Medical from '@/pages/Medical'
import Prescriptions from '@/pages/Prescriptions'
import Gallery from '@/pages/Gallery'
import Reminders from '@/pages/Reminders'
import Training from '@/pages/Training'

export default function App() {
  const { auth, loading, error, login, logout, expire } = useAuth()

  if (!auth) {
    return <Login onLogin={login} loading={loading} error={error} />
  }

  return (
    <PetProvider auth={auth} onExpire={expire} onLogout={logout}>
      <Routes>
        <Route path="/" element={<PetList />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/events" element={<Events />} />
          <Route path="/medical" element={<Medical />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/training" element={<Training />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PetProvider>
  )
}
