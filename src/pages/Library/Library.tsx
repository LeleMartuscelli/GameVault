import {
  Clock3,
  Heart,
  Search,
  Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGameImage } from '../../data/gameImage'
import {
  getGames,
  updateGame,
} from '../../services/gameApi'
import type { Game } from '../../types/games'

function Library() {
  const navigate = useNavigate()

  const [games, setGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function loadGames() {
      try {
        const apiGames = await getGames()
        setGames(apiGames)
      } catch (error) {
        console.error(
          'Erro ao carregar jogos:',
          error
        )
      }
    }

    loadGames()
  }, [])

  const filteredGames = games.filter((game) =>
    game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  async function handleToggleFavorite(
    event: React.MouseEvent<HTMLButtonElement>,
    game: Game
  ) {
    event.stopPropagation()

    try {
      const updatedGame = await updateGame(
        game.id,
        {
          title: game.title,
          platform: game.platform,
          hoursPlayed: game.hoursPlayed,
          timesCompleted: game.timesCompleted,
          achievements: game.achievements,
          status: game.status,
          favorite: !game.favorite,
        }
      )

      setGames((currentGames) =>
        currentGames.map((currentGame) =>
          currentGame.id === updatedGame.id
            ? updatedGame
            : currentGame
        )
      )
    } catch (error) {
      console.error(
        'Erro ao atualizar favorito:',
        error
      )

      alert(
        'Não foi possível atualizar o favorito.'
      )
    }
  }

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <h1>Biblioteca</h1>
          <p>Todos os jogos da sua coleção.</p>
        </div>
      </header>

      {games.length > 0 && (
        <div className="library-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar jogo..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>
      )}

      {games.length === 0 ? (
        <section className="library-empty">
          <h2>Sua biblioteca está vazia</h2>

          <p>
            Adicione seu primeiro jogo para começar
            a montar sua coleção.
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() =>
              navigate('/adicionar')
            }
          >
            Adicionar jogo
          </button>
        </section>
      ) : filteredGames.length === 0 ? (
        <section className="library-empty">
          <h2>Nenhum jogo encontrado</h2>

          <p>
            Não encontramos nenhum jogo com "
            {searchTerm}".
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() =>
              setSearchTerm('')
            }
          >
            Limpar busca
          </button>
        </section>
      ) : (
        <section className="library-grid">
          {filteredGames.map((game) => {
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
                    className={
                      game.favorite
                        ? 'favorite-button active'
                        : 'favorite-button'
                    }
                    aria-label={
                      game.favorite
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                    }
                    title={
                      game.favorite
                        ? 'Remover dos favoritos'
                        : 'Adicionar aos favoritos'
                    }
                    onClick={(event) =>
                      handleToggleFavorite(
                        event,
                        game
                      )
                    }
                  >
                    <Heart
                      size={20}
                      fill={
                        game.favorite
                          ? 'currentColor'
                          : 'none'
                      }
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

export default Library