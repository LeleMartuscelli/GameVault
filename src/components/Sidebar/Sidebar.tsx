import { NavLink } from 'react-router-dom'
import {
  Gamepad2,
  Heart,
  LayoutDashboard,
  Library,
  PlusCircle,
  Settings,
} from 'lucide-react'

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Gamepad2 size={24} />
        </div>

        <div>
          <h2>GameVault</h2>
          <p>Sua biblioteca de jogos</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/">
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/biblioteca">
          <Library size={20} />
          <span>Biblioteca</span>
        </NavLink>

        <NavLink to="/favoritos">
          <Heart size={20} />
          <span>Favoritos</span>
        </NavLink>

        <NavLink to="/adicionar">
          <PlusCircle size={20} />
          <span>Adicionar jogo</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="settings-button"
          aria-label="Configurações"
          title="Configurações"
        >
          <Settings size={21} />
          <span>Configurações</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar