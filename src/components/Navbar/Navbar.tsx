import './Navbar.css'
import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bell,
  Clock3,
  Gamepad2,
  Menu,
  Moon,
  Plus,
  Search,
  Sun,
  Trophy,
  UserRound,
  X,
} from 'lucide-react'

import { getGameImage } from '../../data/gameImage'
import { getGames } from '../../services/gameApi'
import type { Game } from '../../types/games'

function Navbar() {
  const navigate = useNavigate()

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('gamevault-theme') === 'dark'
      ? 'dark'
      : 'light'
  })

  const [games, setGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gamevault-theme', theme)
  }, [theme])

  useEffect(() => {
    async function loadGames() {
      try {
        const data = await getGames()
        setGames(data)
      } catch (error) {
        console.error('Erro ao carregar jogos da navbar:', error)
      }
    }

    loadGames()
  }, [])

  const searchResults = searchTerm.trim()
    ? games.filter((game) =>
        game.title
          .toLowerCase()
          .includes(searchTerm.trim().toLowerCase())
      )
    : []

  const totalHours = games.reduce(
    (total, game) => total + game.hoursPlayed,
    0
  )

  const completedGames = games.filter(
    (game) => game.timesCompleted > 0
  ).length

  function toggleTheme() {
    setTheme((current) =>
      current === 'light' ? 'dark' : 'light'
    )
  }

  function openGame(id: number) {
    setSearchTerm('')
    navigate(`/jogo/${id}`)
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <header className="gv-navbar">
      <div className="gv-navbar-inner">
        <NavLink
          to="/"
          className="gv-navbar-brand"
          onClick={closeMobileMenu}
        >
          GameVault
        </NavLink>

        <nav
          className={`gv-navbar-links ${
            mobileMenuOpen ? 'is-open' : ''
          }`}
          aria-label="Navegação principal"
        >
          <NavLink to="/" end onClick={closeMobileMenu}>
            Início
          </NavLink>

          <NavLink
            to="/biblioteca"
            onClick={closeMobileMenu}
          >
            Biblioteca
          </NavLink>

          <NavLink
            to="/favoritos"
            onClick={closeMobileMenu}
          >
            Favoritos
          </NavLink>
        </nav>

        <div className="gv-navbar-actions">
          <div className="gv-navbar-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar jogos..."
              aria-label="Buscar jogos"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm.trim() && (
              <div className="gv-navbar-search-results">
                {searchResults.length ? (
                  searchResults.map((game) => {
                    const image = getGameImage(game.title)

                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => openGame(game.id)}
                      >
                        {image ? (
                          <img src={image} alt="" />
                        ) : (
                          <Gamepad2 size={20} />
                        )}

                        <span>{game.title}</span>
                      </button>
                    )
                  })
                ) : (
                  <p>Nenhum jogo encontrado.</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="gv-navbar-add"
            onClick={() => navigate('/adicionar')}
          >
            <Plus size={18} />
            <span>Adicionar jogo</span>
          </button>

          <button
            type="button"
            className="gv-navbar-icon"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? 'Ativar modo escuro'
                : 'Ativar modo claro'
            }
            title={
              theme === 'light'
                ? 'Modo escuro'
                : 'Modo claro'
            }
          >
            {theme === 'light' ? (
              <Moon size={20} />
            ) : (
              <Sun size={20} />
            )}
          </button>

          <div className="gv-navbar-notifications">
            <button
              type="button"
              className="gv-navbar-icon"
              aria-label="Notificações"
              aria-expanded={notificationsOpen}
              onClick={() =>
                setNotificationsOpen((open) => !open)
              }
            >
              <Bell size={20} />
            </button>

            {notificationsOpen && (
              <div className="gv-navbar-notification-panel">
                <strong>Notificações</strong>

                <p>
                  <Gamepad2 size={16} />
                  {games.length} jogos cadastrados
                </p>

                <p>
                  <Clock3 size={16} />
                  {totalHours.toLocaleString('pt-BR')}h jogadas
                </p>

                <p>
                  <Trophy size={16} />
                  {completedGames} jogos zerados
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="gv-navbar-profile"
            aria-label="Perfil (em desenvolvimento)"
            title="Perfil em desenvolvimento"
          >
            <UserRound size={21} />
          </button>

          <button
            type="button"
            className="gv-navbar-icon gv-navbar-menu-button"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            onClick={() =>
              setMobileMenuOpen((open) => !open)
            }
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
