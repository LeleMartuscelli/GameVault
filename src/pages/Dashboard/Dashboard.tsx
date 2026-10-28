
import {
  ArrowRight,
  Clock3,
  Gamepad2,
  Medal,
  Play,
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

  // Carregar jogos cadastrados na API
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

  // Jogo em destaque
  const featuredGame = allGames.find((game) =>
    game.title
      .toLowerCase()
      .includes('the last of us part ii')
  )

  // Estatísticas da biblioteca
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

  // Últimos jogos cadastrados
  const recentGames = [...allGames]
    .reverse()
    .slice(0, 5)

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
        aria-label="The Last of Us Part II em destaque"
      >
        <img
          src="/banner-gamevault.jpg"
          alt="Ellie escondida atrás de uma árvore em The Last of Us Part II"
          className="gv-cinematic-image"
        />

        <div
          className="gv-cinematic-overlay"
          aria-hidden="true"
        />

        {/* CONTEÚDO DO BANNER */}
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
              <Play
                size={15}
                fill="currentColor"
              />
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
              Seus jogos. Suas histórias.
            </h2>

            <p>
              Reviva suas aventuras e continue
              de onde parou.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/biblioteca')}
          >
            Ver todos
            <ArrowRight size={17} />
          </button>
        </div>

        {/* ERRO NA API */}
        {error && (
          <p
            className="gv-dashboard-message"
            role="alert"
          >
            Não foi possível carregar os jogos.
            Verifique a conexão com a API.
          </p>
        )}

        {/* BIBLIOTECA VAZIA */}
        {!error && recentGames.length === 0 && (
          <p className="gv-dashboard-message">
            Sua biblioteca está vazia.
          </p>
        )}

        {/* CARDS DOS JOGOS */}
        <div className="recent-games-list">
          {recentGames.map((game) => {
            const gameImage = getGameImage(game.title)

            const isCompleted =
              game.timesCompleted > 0

            return (
              <button
                type="button"
                className="recent-game-card"
                key={game.id}
                onClick={() =>
                  navigate(`/jogo/${game.id}`)
                }
              >
                <div className="recent-game-cover">
                  {gameImage ? (
                    <img
                      src={gameImage}
                      alt=""
                    />
                  ) : (
                    <div className="recent-game-placeholder">
                      <Gamepad2 size={30} />
                      <span>{game.title}</span>
                    </div>
                  )}
                </div>

                <div className="gv-recent-game-info">
                  <h3>{game.title}</h3>

                  <span
                    className={
                      isCompleted
                        ? 'recent-game-status completed'
                        : 'recent-game-status playing'
                    }
                  >
                    {isCompleted
                      ? 'Concluído'
                      : 'Na biblioteca'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default Dashboard
