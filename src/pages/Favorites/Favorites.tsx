import { Clock3, Heart, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGameImage } from '../../data/gameImage'
import {
  getGames,
  updateGame,
} from '../../services/gameApi'
import type { Game } from '../../types/games'

function Favorites() {
  const navigate = useNavigate()

  const [favoriteGames, setFavoriteGames] =
    useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavoriteGames() {
      try {
        const games = await getGames()

        const favorites = games.filter(
          (game) => game.favorite
        )

        setFavoriteGames(favorites)
      } catch (error) {
        console.error(
          'Erro ao carregar favoritos:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteGames()
  }, [])

  async function handleRemoveFavorite(
    game: Game
  ) {
    try {
      await updateGame(game.id, {
        title: game.title,
        platform: game.platform,
        hoursPlayed: game.hoursPlayed,
        timesCompleted: game.timesCompleted,
        achievements: game.achievements,
        status: game.status,
        favorite: false,
      })

      setFavoriteGames((currentGames) =>
        currentGames.filter(
          (currentGame) =>
            currentGame.id !== game.id
        )
      )
    } catch (error) {
      console.error(
        'Erro ao remover favorito:',
        error
      )

      alert(
        'Não foi possível remover o jogo dos favoritos.'
      )
    }
  }

  if (loading) {
    return (
      <main className="library-page">
        <header className="library-header">
          <div>
            <h1>Favoritos</h1>
            <p>Carregando seus jogos favoritos...</p>
          </div>
        </header>
      </main>
    )
  }

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <h1>Favoritos</h1>
          <p>
            Seus jogos favoritos em um só lugar.
          </p>
        </div>
      </header>

      {favoriteGames.length === 0 ? (
        <section className="library-empty">
          <Heart size={42} />

          <h2>Nenhum favorito ainda</h2>

          <p>
            Marque jogos com o coração na Biblioteca
            para encontrá-los aqui.
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() =>
              navigate('/biblioteca')
            }
          >
            Ir para a biblioteca
          </button>
        </section>
      ) : (
        <section className="library-grid">
          {favoriteGames.map((game) => {
            const gameImage =
              getGameImage(game.title)

            return (
              <article
                className="game-card"
                key={game.id}
              >
                <div className="game-card-image">
                  {gameImage ? (
                    <img
                      src={gameImage}
                      alt={game.title}
                      className="game-card-cover"
                    />
                  ) : (
                    <div className="game-card-placeholder">
                      {game.title}
                    </div>
                  )}

                  <button
                    type="button"
                    className="favorite-button active"
                    aria-label="Remover dos favoritos"
                    title="Remover dos favoritos"
                    onClick={() =>
                      handleRemoveFavorite(game)
                    }
                  >
                    <Heart
                      size={20}
                      fill="currentColor"
                    />
                  </button>
                </div>

                <div className="game-card-content">
                  <h2>{game.title}</h2>

                  <div className="game-card-info">
                    <span>
                      <Clock3 size={15} />

                      {game.hoursPlayed.toLocaleString(
                        'pt-BR'
                      )}
                      h jogadas
                    </span>

                    {game.timesCompleted > 0 && (
                      <span>
                        <Trophy size={15} />

                        Zerado{' '}
                        {game.timesCompleted}{' '}
                        {game.timesCompleted === 1
                          ? 'vez'
                          : 'vezes'}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="game-card-button"
                    onClick={() =>
                      navigate(
                        `/jogo/${game.id}`
                      )
                    }
                  >
                    Ver detalhes
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </main>
  )
}

export default Favorites