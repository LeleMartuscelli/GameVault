
import './Navbar.css'

import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

import {
  Gamepad2,
  Menu,
  Moon,
  Plus,
  Search,
  Settings2,
  Sun,
  UserRound,
  X,
} from 'lucide-react'

import { getGameImage } from '../../data/gameImage'
import { getGames } from '../../services/gameApi'
import type { Game } from '../../types/games'

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  // TEMA
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('gamevault-theme') === 'dark'
      ? 'dark'
      : 'light'
  })

  // ESTADOS
  const [games, setGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // REFERÊNCIAS
  const settingsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // APLICAR TEMA
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gamevault-theme', theme)
  }, [theme])

  // CARREGAR JOGOS
  useEffect(() => {
    let active = true

    async function loadGames() {
      try {
        const data = await getGames()

        if (active) {
          setGames(data)
        }
      } catch (error) {
        console.error(
          'Erro ao carregar jogos da navbar:',
          error
        )
      }
    }

    void loadGames()

    return () => {
      active = false
    }
  }, [location.pathname])

  // FECHAR PAINÉIS AO CLICAR FORA OU PRESSIONAR ESC
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) return

      if (
        settingsRef.current &&
        !settingsRef.current.contains(target)
      ) {
        setSettingsOpen(false)
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSettingsOpen(false)
        setSearchOpen(false)
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      )

      document.removeEventListener(
        'keydown',
        handleEscape
      )
    }
  }, [])

  // PESQUISA
  const normalizedSearch = searchTerm.trim().toLowerCase()

  const searchResults = normalizedSearch
    ? games.filter((game) =>
        game.title.toLowerCase().includes(normalizedSearch)
      )
    : []

  // FUNÇÕES
  function toggleTheme() {
    setTheme((current) =>
      current === 'light' ? 'dark' : 'light'
    )
  }

  function closeMenus() {
    setMobileMenuOpen(false)
    setSettingsOpen(false)
    setSearchOpen(false)
  }

  function openGame(id: Game['id']) {
    setSearchTerm('')
    closeMenus()
    navigate(`/jogo/${id}`)
  }

  function openAddGame() {
    closeMenus()
    navigate('/adicionar')
  }

  return (
    <header className="gv-navbar">
      <div className="gv-navbar-inner">

        {/* LOGOTIPO */}
        <NavLink
          to="/"
          className="gv-navbar-brand"
          onClick={closeMenus}
          aria-label="GameVault — início"
        >
          GameVault
        </NavLink>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav
          className={`gv-navbar-links ${
            mobileMenuOpen ? 'is-open' : ''
          }`}
          aria-label="Navegação principal"
        >
          <NavLink
            to="/"
            end
            onClick={closeMenus}
          >
            Início
          </NavLink>

          <NavLink
            to="/biblioteca"
            onClick={closeMenus}
          >
            Biblioteca
          </NavLink>

          <NavLink
            to="/favoritos"
            onClick={closeMenus}
          >
            Favoritos
          </NavLink>
        </nav>

        {/* AÇÕES */}
        <div className="gv-navbar-actions">

          {/* PESQUISA */}
          <div
            className="gv-navbar-search"
            ref={searchRef}
          >
            <Search
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

            <input
              type="search"
              placeholder="Buscar jogos..."
              aria-label="Buscar jogos"
              value={searchTerm}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setSearchOpen(true)
              }}
            />

            {searchTerm && (
              <button
                type="button"
                className="gv-navbar-search-clear"
                aria-label="Limpar pesquisa"
                onClick={() => {
                  setSearchTerm('')
                  setSearchOpen(false)
                }}
              >
                <X size={15} aria-hidden="true" />
              </button>
            )}

            {searchOpen && normalizedSearch && (
              <div className="gv-navbar-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((game) => {
                    const image = getGameImage(game.title)

                    return (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => openGame(game.id)}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            loading="lazy"
                          />
                        ) : (
                          <span className="gv-navbar-result-placeholder">
                            <Gamepad2
                              size={18}
                              aria-hidden="true"
                            />
                          </span>
                        )}

                        <span className="gv-navbar-result-title">
                          {game.title}
                        </span>
                      </button>
                    )
                  })
                ) : (
                  <p>Nenhum jogo encontrado.</p>
                )}
              </div>
            )}
          </div>

          {/* BOTÃO MODO CLARO / ESCURO */}
          <button
            type="button"
            className="gv-navbar-icon gv-navbar-theme"
            onClick={toggleTheme}
            aria-label={
              theme === 'light'
                ? 'Ativar modo escuro'
                : 'Ativar modo claro'
            }
            title={
              theme === 'light'
                ? 'Ativar modo escuro'
                : 'Ativar modo claro'
            }
          >
            {theme === 'light' ? (
              <Moon
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            ) : (
              <Sun
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            )}
          </button>

          {/* CONFIGURAÇÕES */}
          <div
            className="gv-navbar-settings"
            ref={settingsRef}
          >
            <button
              type="button"
              className="gv-navbar-icon"
              aria-label="Configurações"
              title="Configurações"
              aria-expanded={settingsOpen}
              aria-controls="gv-navbar-settings-menu"
              onClick={() => {
                setSettingsOpen((open) => !open)
                setSearchOpen(false)
              }}
            >
              <Settings2
                size={21}
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </button>

            {settingsOpen && (
              <div
                id="gv-navbar-settings-menu"
                className="gv-navbar-settings-panel"
              >
                <div className="gv-navbar-settings-heading">
                  <strong>Configurações</strong>
                  <span>Personalize sua experiência</span>
                </div>

                <button
                  type="button"
                  className="gv-navbar-settings-item"
                  onClick={openAddGame}
                >
                  <Plus
                    size={18}
                    aria-hidden="true"
                  />

                  <span>Adicionar jogo</span>
                </button>

                <button
                  type="button"
                  className="gv-navbar-settings-item"
                  onClick={toggleTheme}
                >
                  {theme === 'light' ? (
                    <Moon
                      size={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <Sun
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    {theme === 'light'
                      ? 'Ativar modo escuro'
                      : 'Ativar modo claro'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* PERFIL */}
          <button
            type="button"
            className="gv-navbar-profile"
            aria-label="Perfil — em desenvolvimento"
            title="Perfil em desenvolvimento"
            disabled
          >
            <UserRound
              size={21}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </button>

          {/* MENU MOBILE */}
          <button
            type="button"
            className="gv-navbar-icon gv-navbar-menu-button"
            aria-label={
              mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'
            }
            aria-expanded={mobileMenuOpen}
            onClick={() => {
              setMobileMenuOpen((open) => !open)
              setSettingsOpen(false)
              setSearchOpen(false)
            }}
          >
            {mobileMenuOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <Menu size={22} aria-hidden="true" />
            )}
          </button>

        </div>
      </div>
    </header>
  )
}

export default Navbar
