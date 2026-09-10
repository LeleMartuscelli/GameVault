import {
  Bell,
  Clock3,
  Gamepad2,
  Medal,
  Plus,
  Search,
  Trophy,
  User,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../data/gameStorage'
import dashboardBanner from '../../assets/games/call-of-duty-modern-III.jpg'

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

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Dashboard</h1>
          <p>Visão geral da sua biblioteca de jogos.</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="dashboard-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar jogos..."
            />
          </div>

          <button
            type="button"
            className="dashboard-icon-button"
            aria-label="Notificações"
            title="Notificações"
          >
            <Bell size={20} />
          </button>

          <button
            type="button"
            className="dashboard-profile"
            aria-label="Perfil"
            title="Perfil"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      <section className="featured-game">
        <img
          src={dashboardBanner}
          alt="Call of Duty: Modern Warfare III"
          className="featured-game-image"
        />

        <div className="featured-game-overlay" />

        <div className="featured-game-content">
          <h2>
            Seus jogos.
            <br />
            Suas histórias.
          </h2>

          <p>
            Organize, acompanhe e nunca perca de vista
            o que realmente importa: jogar.
          </p>

          <div className="featured-actions">
            <button
              type="button"
              className="featured-button featured-button-primary"
              onClick={() => navigate('/adicionar')}
            >
              <Plus size={18} />
              Adicionar jogo
            </button>

            <button
              type="button"
              className="featured-button featured-button-secondary"
              onClick={() => navigate('/biblioteca')}
            >
              Ver biblioteca
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card stat-card-games">
          <div className="stat-icon">
            <Gamepad2 size={25} />
          </div>

          <div className="stat-card-content">
            <strong>{totalGames}</strong>
            <span>Jogos no total</span>
          </div>
        </article>

        <article className="stat-card stat-card-completed">
          <div className="stat-icon">
            <Trophy size={25} />
          </div>

          <div className="stat-card-content">
            <strong>{completedGames}</strong>
            <span>Zerados</span>
          </div>
        </article>

        <article className="stat-card stat-card-hours">
          <div className="stat-icon">
            <Clock3 size={25} />
          </div>

          <div className="stat-card-content">
            <strong>
              {totalHours.toLocaleString('pt-BR')}h
            </strong>

            <span>Horas jogadas</span>
          </div>
        </article>

        <article className="stat-card stat-card-achievements">
          <div className="stat-icon">
            <Medal size={25} />
          </div>

          <div className="stat-card-content">
            <strong>{totalAchievements}</strong>
            <span>Conquistas</span>
          </div>
        </article>
      </section>

      <section className="recent-games">
        <div className="recent-games-header">
          <h2>Jogos recentes</h2>

          <button
            type="button"
            onClick={() => navigate('/biblioteca')}
          >
            Ver todos
          </button>
        </div>

        <div className="recent-games-list">
          <article className="recent-game-card">
            <div className="recent-game-cover">
              <img
                src={dashboardBanner}
                alt="Call of Duty: Modern Warfare III"
              />
            </div>

            <h3>Call of Duty: Modern Warfare III</h3>
            <span>Em andamento</span>
          </article>

          <article className="recent-game-card">
            <div className="recent-game-cover recent-game-placeholder">
              Warzone
            </div>

            <h3>Call of Duty: Warzone</h3>
            <span>Em andamento</span>
          </article>

          <article className="recent-game-card">
            <div className="recent-game-cover recent-game-placeholder">
              CS2
            </div>

            <h3>Counter-Strike 2</h3>
            <span>Em andamento</span>
          </article>

          <article className="recent-game-card">
            <div className="recent-game-cover recent-game-placeholder">
              TLOU II
            </div>

            <h3>The Last of Us Part II</h3>
            <span>Zerado</span>
          </article>

          <article className="recent-game-card">
            <div className="recent-game-cover recent-game-placeholder">
              ARC
            </div>

            <h3>ARC Raiders</h3>
            <span>Planejado</span>
          </article>
        </div>
      </section>
    </main>
  )
}

export default Dashboard