
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Library from './pages/Library/Library'
import AddGame from './pages/AddGame/Addgame'
import GameDetails from './pages/GameDetails/GameDetails'
import EditGame from './pages/EditGame/EditGame'
import Favorites from './pages/Favorites/Favorites'
import Login from './pages/Login/Login'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login sem a barra de navegação */}
        <Route path="/login" element={<Login />} />

        {/* Páginas principais */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/adicionar" element={<AddGame />} />
          <Route path="/jogo/:id" element={<GameDetails />} />
          <Route path="/editar/:id" element={<EditGame />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
