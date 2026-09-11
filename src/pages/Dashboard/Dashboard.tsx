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
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../data/gameStorage'
import { getGameImage } from '../../data/gameImage'
import dashboardBanner from '../../assets/games/call-of-duty-modern-III.jpg'

function Dashboard() {
  const navigate = useNavigate()

  const allGames = getAllGames()

  const [searchTerm, setSearchTerm] = useState('')
  const [notificationsOpen, setNotificationsOpen] =
    useState(false)

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

  const recentGames = [...allGames]
    .reverse()
    .slice(0, 5)

  const searchResults =
    searchTerm.trim().length > 0
      ? allGames.filter((game) =>
          game.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      : []

  function handleGameSearch(gameId: number) {
    setSearchTerm('')
    navigate(`/jogo/${gameId}`)
  }

  function handleNotifications() {
    setNotificationsOpen(
      (currentState) => !currentState
    )
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Dashboard</h1>
          <p>Visão geral da sua biblioteca de jogos.</p>
        </div>

        <div className="dashboard-header-actions">
          <div className="dashboard-search-wrapper">
            <div className="dashboard-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Buscar jogos..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            {searchTerm.trim().length > 0 && (
              <div className="dashboard-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((game) => {
                    const gameImage =
                      game.image ||
                      getGameImage(game.title)

                    return (
                      <button
                        type="button"
                        className="dashboard-search-result"
                        key={game.id}
                        onClick={() =>
                          handleGameSearch(game.id)
                        }
                      >
                        <div className="dashboard-search-result-image">
                          {gameImage ? (
                            <img
                              src={gameImage}
                              alt={game.title}
                            />
                          ) : (
                            <Gamepad2 size={18} />
                          )}
                        </div>

                        <div className="dashboard-search-result-info">
                          <strong>{game.title}</strong>

                          <span>
                            {game.hoursPlayed.toLocaleString(
                              'pt-BR'
                            )}
                            h jogadas
                          </span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="dashboard-search-empty">
                    Nenhum jogo encontrado.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="notifications-wrapper">
            <button
              type="button"
              className="dashboard-icon-button"
              aria-label="Notificações"
              title="Notificações"
              onClick={handleNotifications}
            >
              <Bell size={20} />
            </button>

            {notificationsOpen && (
              <div className="notifications-panel">
                <div className="notifications-header">
                  <strong>Notificações</strong>
                </div>

                <div className="notification-item">
                  <div className="notification-icon">
                    <Gamepad2 size={18} />
                  </div>

                  <div>
                    <strong>Biblioteca atualizada</strong>

                    <p>
                      Você possui {totalGames}{' '}
                      {totalGames === 1
                        ? 'jogo cadastrado.'
                        : 'jogos cadastrados.'}
                    </p>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-icon">
                    <Clock3 size={18} />
                  </div>

                  <div>
                    <strong>Tempo de jogo</strong>

                    <p>
                      Você já registrou{' '}
                      {totalHours.toLocaleString('pt-BR')}h
                      de gameplay.
                    </p>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-icon">
                    <Trophy size={18} />
                  </div>

                  <div>
                    <strong>Progresso</strong>

                    <p>
                      {completedGames === 0
                        ? 'Nenhum jogo zerado ainda.'
                        : `${completedGames} ${
                            completedGames === 1
                              ? 'jogo zerado.'
                              : 'jogos zerados.'
                          }`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

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

      {recentGames.length > 0 && (
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
            {recentGames.map((game) => {
              const gameImage =
                game.image ||
                getGameImage(game.title)

              const isCompleted =
                game.timesCompleted > 0

              return (
                <article
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
                        alt={game.title}
                      />
                    ) : (
                      <div className="recent-game-placeholder">
                        {game.title}
                      </div>
                    )}
                  </div>

                  <h3>{game.title}</h3>

                  <span
                    className={
                      isCompleted
                        ? 'recent-game-status completed'
                        : 'recent-game-status playing'
                    }
                  >
                    {isCompleted
                      ? 'Zerado'
                      : 'Em andamento'}
                  </span>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

export default Dashboard