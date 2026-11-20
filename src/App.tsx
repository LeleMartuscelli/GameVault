import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { useAuth } from './contexts/useAuth'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Library from './pages/Library/Library'
import Explore from './pages/Explore/Explore'
import AddGame from './pages/AddGame/Addgame'
import GameDetails from './pages/GameDetails/GameDetails'
import EditGame from './pages/EditGame/EditGame'
import Favorites from './pages/Favorites/Favorites'
import Login from './pages/Login/Login'
import Profile from './pages/Profile/Profile'

import './App.css'

function AdminRoute() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <main role="status" aria-live="polite" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p>Verificando acesso administrativo...</p>
      </main>
    )
  }

  if (!isAdmin) return <Navigate to="/login" replace />
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/explorar" element={<Explore />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/jogo/:id" element={<GameDetails />} />
          <Route element={<AdminRoute />}>
            <Route path="/adicionar" element={<AddGame />} />
            <Route path="/editar/:id" element={<EditGame />} />
            <Route path="/perfil" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
