import { Search, Clock3, Trophy } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllGames } from '../../data/gameStorage'

import warzoneImage from '../../assets/games/call-of-duty-warzone.jpg'
import cs2Image from '../../assets/games/counter-strike-2.jpg'
import tlouImage from '../../assets/games/the-last-of-us-part-ii.jpg'
import arcRaidersImage from '../../assets/games/arc-raiders.jpg'

function Library() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')

  const allGames = getAllGames()

  const filteredGames = allGames.filter((game) =>
    game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const getGameImage = (title: string) => {
    switch (title) {
      case 'Call of Duty: Warzone':
        return warzoneImage

      case 'Counter-Strike 2':
        return cs2Image

      case 'The Last of Us Part II':
        return tlouImage

      case 'ARC Raiders':
        return arcRaidersImage

      default:
        return null
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

      {filteredGames.length > 0 ? (
        <section className="library-grid">
          {filteredGames.map((game) => {
            const gameImage =
              game.image || getGameImage(game.title)

            return (
              <article className="game-card" key={game.id}>
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
      ) : (
        <div className="library-empty">
          <h2>Nenhum jogo encontrado</h2>
          <p>
            Tente buscar por outro nome.
          </p>
        </div>
      )}
    </main>
  )
}

export default Library