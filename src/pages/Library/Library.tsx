import { Clock3, Search, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../data/gameStorage'
import { getGameImage } from '../../data/gameImage'

function Library() {
  const navigate = useNavigate()
  const allGames = getAllGames()

  const [searchTerm, setSearchTerm] = useState('')

  const filteredGames = allGames.filter((game) =>
    game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  return (
    <main className="library-page">
      <header className="library-header">
        <div>
          <h1>Biblioteca</h1>
          <p>Todos os jogos da sua coleção.</p>
        </div>
      </header>

      {allGames.length > 0 && (
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

      {allGames.length === 0 ? (
        <section className="library-empty">
          <h2>Sua biblioteca está vazia</h2>

          <p>
            Adicione seu primeiro jogo para começar a montar
            sua coleção.
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() => navigate('/adicionar')}
          >
            Adicionar jogo
          </button>
        </section>
      ) : filteredGames.length === 0 ? (
        <section className="library-empty">
          <h2>Nenhum jogo encontrado</h2>

          <p>
            Não encontramos nenhum jogo com
            "{searchTerm}".
          </p>

          <button
            type="button"
            className="game-card-button"
            onClick={() => setSearchTerm('')}
          >
            Limpar busca
          </button>
        </section>
      ) : (
        <section className="library-grid">
          {filteredGames.map((game) => {
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

export default Library