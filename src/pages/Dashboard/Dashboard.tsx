
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Gamepad2,
  Medal,
  Play,
  Plus,
  Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getGameImage } from '../../data/gameImage'
import { getGames } from '../../services/gameApi'
import type { Game } from '../../types/games'

import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()

  const [allGames, setAllGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeGameIndex, setActiveGameIndex] = useState(0)

  useEffect(() => {
    async function loadGames() {
      try {
        const games = await getGames()

        setAllGames(games)
        setError(false)
      } catch (err) {
        console.error(
          'Erro ao carregar jogos do Dashboard:',
          err
        )

        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const featuredGame = allGames.find((game) =>
    game.title
      .toLowerCase()
      .includes('modern warfare 4')
  )

  const totalGames = allGames.length

  const totalHours = allGames.reduce(
    (total, game) => total + game.hoursPlayed,
    0
  )

  const completedGames = allGames.filter(
    (game) => game.timesCompleted > 0
  ).length

  const totalAchievements = allGames.reduce(
    (total, game) => total + game.achievements,
    0
  )

  const recentGames = [...allGames].reverse().slice(0, 5)

  const changeActiveGame = (direction: number) => {
    if (recentGames.length === 0) return

    setActiveGameIndex((current) =>
      (current + direction + recentGames.length) %
      recentGames.length
    )
  }

  const getCardPosition = (index: number) => {
    const count = recentGames.length

    if (count === 0) return 'hidden'

    const distance =
      (index - activeGameIndex + count) % count

    if (distance === 0) return 'active'
    if (distance === 1) return 'right'
    if (distance === count - 1) return 'left'

    if (count >= 5 && distance === 2) {
      return 'far-right'
    }

    if (count >= 5 && distance === count - 2) {
      return 'far-left'
    }

    return 'hidden'
  }

  if (loading) {
    return (
      <main className="dashboard gv-dashboard">
        <p className="gv-dashboard-message">
          Carregando sua biblioteca...
        </p>
      </main>
    )
  }

  return (
    <main className="dashboard gv-dashboard">
      {/* BANNER CINEMATOGRÁFICO */}
      <section
        className="gv-cinematic-hero"
        aria-label="Modern Warfare 4 em destaque"
      >
        <img
          src="/banner-gamevault.jpg"
          alt="Arte promocional de Modern Warfare 4"
          className="gv-cinematic-image"
        />

        <div
          className="gv-cinematic-overlay"
          aria-hidden="true"
        />

        <div className="gv-cinematic-content">
          <span className="gv-cinematic-eyebrow">
            CONTINUE SUA JORNADA
          </span>

          <h1>
            MODERN
            <br />
            WARFARE 4
          </h1>

          <div className="gv-cinematic-actions">
            <button
              type="button"
              className="gv-cinematic-primary"
              disabled={!featuredGame}
              onClick={() => {
                if (featuredGame) {
                  navigate(`/jogo/${featuredGame.id}`)
                }
              }}
            >
              <Play size={15} fill="currentColor" />
              Ver detalhes
            </button>

            <button
              type="button"
              className="gv-cinematic-secondary"
              onClick={() => navigate('/biblioteca')}
            >
              Na minha biblioteca
            </button>
          </div>
        </div>
      </section>

      {/* ESTATÍSTICAS DA BIBLIOTECA */}
      <section
        className="stats-grid gv-stats-grid"
        aria-label="Estatísticas da biblioteca"
      >
        <article className="stat-card stat-card-games">
          <div className="stat-icon">
            <Gamepad2 size={23} />
          </div>

          <div className="stat-card-content">
            <strong>{totalGames}</strong>
            <span>Jogos na biblioteca</span>
          </div>
        </article>

        <article className="stat-card stat-card-hours">
          <div className="stat-icon">
            <Clock3 size={23} />
          </div>

          <div className="stat-card-content">
            <strong>
              {totalHours.toLocaleString('pt-BR')}h
            </strong>
            <span>Horas jogadas</span>
          </div>
        </article>

        <article className="stat-card stat-card-completed">
          <div className="stat-icon">
            <Trophy size={23} />
          </div>

          <div className="stat-card-content">
            <strong>{completedGames}</strong>
            <span>Jogos concluídos</span>
          </div>
        </article>

        <article className="stat-card stat-card-achievements">
          <div className="stat-icon">
            <Medal size={23} />
          </div>

          <div className="stat-card-content">
            <strong>{totalAchievements}</strong>
            <span>Conquistas</span>
          </div>
        </article>
      </section>

      {/* COLEÇÃO DE JOGOS */}
      <section className="recent-games gv-recent-games">
        <div className="recent-games-header">
          <div>
            <span className="gv-eyebrow">
              SUA COLEÇÃO
            </span>

            <h2>
              Seus jogos. <span>Suas histórias.</span>
            </h2>

            <p>
              Acompanhe tudo o que você joga, suas conquistas e reviva
              <br className="gv-description-break" />
              os momentos que marcaram a sua jornada.
            </p>
          </div>

          <div className="gv-collection-actions">
            <button
              type="button"
              className="gv-view-all"
              onClick={() => navigate('/biblioteca')}
            >
              Ver todos os jogos
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="gv-add-game"
              onClick={() => navigate('/biblioteca')}
            >
              <Plus size={17} />
              Adicionar jogo
            </button>
          </div>
        </div>

        {error && (
          <p className="gv-dashboard-message" role="alert">
            Não foi possível carregar os jogos.
            Verifique a conexão com a API.
          </p>
        )}

        {!error && recentGames.length === 0 && (
          <p className="gv-dashboard-message">
            Sua biblioteca está vazia.
          </p>
        )}

        {!error && recentGames.length > 0 && (
          <div className="gv-games-carousel gv-games-carousel-wide">
            <div className="gv-games-carousel-stage">
              {recentGames.map((game, index) => {
                const gameImage = getGameImage(game.title)
                const position = getCardPosition(index)
                const isActive = position === 'active'

                return (
                  <article
                    key={game.id}
                    className={`gv-showcase-card gv-showcase-${position}`}
                    aria-hidden={position === 'hidden'}
                  >
                    <div className="gv-showcase-image">
                      {gameImage ? (
                        <img src={gameImage} alt="" />
                      ) : (
                        <div className="gv-showcase-placeholder">
                          <Gamepad2 size={34} />
                        </div>
                      )}
                    </div>

                    <div className="gv-showcase-gradient" />

                    <div className="gv-showcase-content">
                      <h3>{game.title}</h3>

                      <span className="gv-showcase-platform">
                        {game.platform}
                      </span>
                    </div>

                    <div className="gv-showcase-stats">
                      <div>
                        <Clock3 size={16} />
                        <span>
                          <strong>
                            {game.hoursPlayed.toLocaleString('pt-BR')}h
                          </strong>
                          <small>Horas jogadas</small>
                        </span>
                      </div>

                      <div>
                        <Trophy size={16} />
                        <span>
                          <strong>{game.timesCompleted}</strong>
                          <small>Vezes zerado</small>
                        </span>
                      </div>

                      <div>
                        <Medal size={16} />
                        <span>
                          <strong>{game.achievements}</strong>
                          <small>Conquistas</small>
                        </span>
                      </div>

                      <button
                        type="button"
                        className="gv-showcase-details"
                        aria-label={`Ver detalhes de ${game.title}`}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() =>
                          navigate(`/jogo/${game.id}`)
                        }
                      >
                        <ChevronRight size={21} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>

            {recentGames.length > 1 && (
              <div
                className="gv-carousel-navigation"
                aria-label="Navegação entre jogos"
              >
                <button
                  type="button"
                  onClick={() => changeActiveGame(-1)}
                  aria-label="Jogo anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                <span>
                  {activeGameIndex + 1} / {recentGames.length}
                </span>

                <button
                  type="button"
                  onClick={() => changeActiveGame(1)}
                  aria-label="Próximo jogo"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ENCERRAMENTO — HISTÓRIA DO JOGADOR */}
      <section className="gv-journey" aria-labelledby="gv-journey-title">
        <div className="gv-journey-visual" aria-hidden="true">
          <Gamepad2 size={112} strokeWidth={0.7} />
        </div>
        <div className="gv-journey-content">
          <span className="gv-eyebrow">SUA JORNADA CONTINUA</span>
          <h2 id="gv-journey-title">
            Cada jogo conta uma história.
            <span> A sua merece ser lembrada.</span>
          </h2>
          <p>
            Das primeiras aventuras às conquistas de hoje.
            Organize seus jogos e preserve os momentos da sua trajetória.
          </p>
          <button type="button" onClick={() => navigate('/biblioteca')}>
            Explorar minha biblioteca <ArrowRight size={17} />
          </button>
        </div>
      </section>

      {/* RODAPÉ — PLATAFORMAS E IDENTIDADE */}
      <footer className="gv-footer">
        <div className="gv-footer-top">
          <div className="gv-footer-brand">
            <strong>GameVault</strong>
            <p>Seus jogos. Suas histórias. Sua trajetória.</p>
          </div>
          <nav className="gv-footer-links" aria-label="Links do rodapé">
            <button type="button" onClick={() => navigate('/')}>Início</button>
            <button type="button" onClick={() => navigate('/biblioteca')}>Biblioteca</button>
            <button type="button" onClick={() => navigate('/favoritos')}>Favoritos</button>
          </nav>
          <div className="gv-footer-platforms" aria-label="Plataformas de jogos">
            {['steam', 'xbox', 'playstation', 'discord'].map((platform) => (
              <span key={platform} className="gv-platform-icon" title={platform}>
                <img
                  src={`https://cdn.simpleicons.org/${platform}/888888`}
                  alt={platform === 'playstation' ? 'PlayStation' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  loading="lazy"
                />
              </span>
            ))}
          </div>
        </div>
        <div className="gv-footer-bottom">
          <span>© {new Date().getFullYear()} GameVault. Todos os direitos reservados.</span>
          <span>Feito para quem vive cada história.</span>
        </div>
      </footer>
    </main>
  )
}

export default Dashboard
