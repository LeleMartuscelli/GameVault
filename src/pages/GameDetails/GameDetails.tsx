import {
  ArrowLeft,
  Clock3,
  Medal,
  Pencil,
  Trash2,
  Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGameImage } from '../../data/gameImage'
import {
  deleteGame,
  getGameById,
} from '../../services/gameApi'
import type { Game } from '../../types/games'

function GameDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function loadGame() {
      if (!id) {
        setNotFound(true)
        setLoading(false)
        return
      }

      try {
        const apiGame = await getGameById(Number(id))
        setGame(apiGame)
      } catch (error) {
        console.error('Erro ao carregar jogo:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [id])

  async function handleDelete() {
    if (!game) {
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${game.title}" da biblioteca?`
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteGame(game.id)

      navigate('/biblioteca')
    } catch (error) {
      console.error('Erro ao excluir jogo:', error)

      alert('Não foi possível excluir o jogo.')
    }
  }

  if (loading) {
    return (
      <main className="game-details-page">
        <h1>Carregando jogo...</h1>
      </main>
    )
  }

  if (notFound || !game) {
    return (
      <main className="game-details-page">
        <h1>Jogo não encontrado</h1>

        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/biblioteca')}
        >
          <ArrowLeft size={18} />
          Voltar para a biblioteca
        </button>
      </main>
    )
  }

  const gameImage = getGameImage(game.title)

  return (
    <main className="game-details-page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate('/biblioteca')}
      >
        <ArrowLeft size={18} />
        Voltar para a biblioteca
      </button>

      <section className="game-details-hero">
        {gameImage ? (
          <img
            src={gameImage}
            alt={game.title}
            className="game-details-image"
          />
        ) : (
          <div className="game-details-placeholder">
            {game.title}
          </div>
        )}

        <div className="game-details-overlay" />

        <div className="game-details-header">
          <span className="game-details-label">
            DETALHES DO JOGO
          </span>

          <h1>{game.title}</h1>
        </div>
      </section>

      <section className="game-details-stats">
        <article className="detail-stat-card">
          <div className="detail-stat-icon">
            <Clock3 size={22} />
          </div>

          <div className="detail-stat-content">
            <span>Horas jogadas</span>

            <strong>
              {game.hoursPlayed.toLocaleString('pt-BR')}h
            </strong>
          </div>
        </article>

        <article className="detail-stat-card">
          <div className="detail-stat-icon">
            <Trophy size={22} />
          </div>

          <div className="detail-stat-content">
            <span>Vezes zerado</span>

            <strong>
              {game.timesCompleted}{' '}
              {game.timesCompleted === 1
                ? 'vez'
                : 'vezes'}
            </strong>
          </div>
        </article>

        <article className="detail-stat-card">
          <div className="detail-stat-icon">
            <Medal size={22} />
          </div>

          <div className="detail-stat-content">
            <span>Conquistas</span>
            <strong>{game.achievements}</strong>
          </div>
        </article>
      </section>

      <section className="game-details-actions">
        <button
          type="button"
          className="edit-game-button"
          onClick={() =>
            navigate(`/editar/${game.id}`)
          }
        >
          <Pencil size={18} />
          Editar jogo
        </button>

        <button
          type="button"
          className="delete-game-button"
          onClick={handleDelete}
        >
          <Trash2 size={18} />
          Excluir jogo
        </button>
      </section>
    </main>
  )
}

export default GameDetails