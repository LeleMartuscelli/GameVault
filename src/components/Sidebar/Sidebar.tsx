import { NavLink } from 'react-router-dom'
import { Gamepad2, LayoutDashboard, Library, PlusCircle } from 'lucide-react'

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

        <NavLink to="/adicionar">
          <PlusCircle size={20} />
          <span>Adicionar jogo</span>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar