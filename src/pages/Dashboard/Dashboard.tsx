import {
  ArrowRight,
  Clock3,
  Gamepad2,
  Medal,
  Trophy,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../data/gameStorage'
import tlouBanner from '../../assets/games/the-last-of-us-part-ii.jpg'

function Dashboard() {
  const navigate = useNavigate()

  const allGames = getAllGames()

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

  const featuredGame = allGames.find(
    (game) => game.title === 'The Last of Us Part II'
  )

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral da sua biblioteca de jogos.</p>
        </div>
      </header>

      <section className="featured-game">
        <img
          src={tlouBanner}
          alt=""
          className="featured-game-background"
        />

        <img
          src={tlouBanner}
          alt="The Last of Us Part II"
          className="featured-game-image"
        />

        <div className="featured-game-overlay" />

        <div className="featured-game-content">
          <span className="featured-label">
            EM DESTAQUE
          </span>

          <h2>The Last of Us Part II</h2>

          <p>
            Zerado {featuredGame?.timesCompleted ?? 0}{' '}
            {(featuredGame?.timesCompleted ?? 0) === 1
              ? 'vez'
              : 'vezes'}
          </p>

          {featuredGame && (
            <button
              type="button"
              className="featured-button"
              onClick={() =>
                navigate(`/jogo/${featuredGame.id}`)
              }
            >
              Ver detalhes
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <Gamepad2 size={22} />

          <div>
            <span>Jogos na biblioteca</span>
            <strong>{totalGames}</strong>
          </div>
        </article>

        <article className="stat-card">
          <Trophy size={22} />

          <div>
            <span>Jogos zerados</span>
            <strong>{completedGames}</strong>
          </div>
        </article>

        <article className="stat-card">
          <Clock3 size={22} />

          <div>
            <span>Horas jogadas</span>
            <strong>
              {totalHours.toLocaleString('pt-BR')}h
            </strong>
          </div>
        </article>

        <article className="stat-card">
          <Medal size={22} />

          <div>
            <span>Conquistas</span>
            <strong>{totalAchievements}</strong>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Dashboard