import { Clock3, Heart, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFavoriteGames,
  toggleFavorite,
} from '../../data/gameStorage'
import { getGameImage } from '../../data/gameImage'

function Favorites() {
  const navigate = useNavigate()

  const [favoriteGames, setFavoriteGames] = useState(
    () => getFavoriteGames()
  )

  function handleRemoveFavorite(gameId: number) {
    toggleFavorite(gameId)
    setFavoriteGames(getFavoriteGames())
  }

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <h1>Favoritos</h1>
          <p>Seus jogos favoritos em um só lugar.</p>
        </div>
      </header>

      {favoriteGames.length === 0 ? (
        <section className="library-empty">
          <Heart size={42} />

          <h2>Nenhum favorito ainda</h2>

          <p>
            Marque jogos com o coração na Biblioteca para
            encontrá-los aqui.
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() => navigate('/biblioteca')}
          >
            Ir para a biblioteca
          </button>
        </section>
      ) : (
        <section className="library-grid">
          {favoriteGames.map((game) => {
            const gameImage =
              game.image || getGameImage(game.title)

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
                      handleRemoveFavorite(game.id)
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

                        Zerado {game.timesCompleted}{' '}
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
                      navigate(`/jogo/${game.id}`)
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