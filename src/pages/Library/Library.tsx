import { Clock3, Trophy } from 'lucide-react'
import { games } from '../../data/games'

import warzoneImage from '../../assets/games/call-of-duty-warzone.jpg'
import cs2Image from '../../assets/games/counter-strike-2.jpg'
import tlouImage from '../../assets/games/the-last-of-us-part-ii.jpg'

function Library() {
  const getGameImage = (title: string) => {
    switch (title) {
      case 'Call of Duty: Warzone':
        return warzoneImage

      case 'Counter-Strike 2':
        return cs2Image

      case 'The Last of Us Part II':
        return tlouImage

      default:
        return ''
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

      <section className="library-grid">
        {games.map((game) => (
          <article className="game-card" key={game.id}>
            <div className="game-card-image">
              <img
                src={getGameImage(game.title)}
                alt={game.title}
                className="game-card-cover"
              />
            </div>

            <div className="game-card-content">
              <h2>{game.title}</h2>

              <div className="game-card-info">
                <span>
                  <Clock3 size={15} />
                  {game.hoursPlayed.toLocaleString('pt-BR')}h jogadas
                </span>

                {game.timesCompleted > 0 && (
                  <span>
                    <Trophy size={15} />
                    Zerado {game.timesCompleted}{' '}
                    {game.timesCompleted === 1 ? 'vez' : 'vezes'}
                  </span>
                )}
              </div>

              <button type="button" className="game-card-button">
                Ver detalhes
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default Library