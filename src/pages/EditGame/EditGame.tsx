import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getGameById,
  updateGame,
} from '../../services/gameApi'
import type {
  Game,
  GameStatus,
} from '../../types/games'

function EditGame() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [game, setGame] = useState<Game | null>(null)

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [status, setStatus] =
    useState<GameStatus>('Quero jogar')
  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] =
    useState('')
  const [achievements, setAchievements] =
    useState('')

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

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

        setTitle(apiGame.title)
        setPlatform(apiGame.platform)
        setStatus(apiGame.status)
        setHoursPlayed(String(apiGame.hoursPlayed))
        setTimesCompleted(
          String(apiGame.timesCompleted)
        )
        setAchievements(String(apiGame.achievements))
      } catch (error) {
        console.error(
          'Erro ao carregar jogo:',
          error
        )

        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [id])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!game) {
      return
    }

    if (!title.trim()) {
      alert('Digite o nome do jogo.')
      return
    }

    try {
      setIsSubmitting(true)

      await updateGame(game.id, {
        title: title.trim(),
        platform,
        hoursPlayed: Number(hoursPlayed) || 0,
        timesCompleted:
          Number(timesCompleted) || 0,
        achievements: Number(achievements) || 0,
        status,
        favorite: game.favorite,
      })

      navigate(`/jogo/${game.id}`)
    } catch (error) {
      console.error(
        'Erro ao atualizar jogo:',
        error
      )

      alert(
        'Não foi possível salvar as alterações.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="add-game-page">
        <header className="add-game-header">
          <h1>Carregando jogo...</h1>
        </header>
      </main>
    )
  }

  if (notFound || !game) {
    return (
      <main className="add-game-page">
        <header className="add-game-header">
          <h1>Jogo não encontrado</h1>
        </header>
      </main>
    )
  }

  return (
    <main className="add-game-page">
      <header className="add-game-header">
        <div>
          <h1>Editar jogo</h1>

          <p>
            Atualize as informações de {game.title}.
          </p>
        </div>
      </header>

      <section className="add-game-card">
        <form
          className="add-game-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="title">
              Nome do jogo
            </label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="platform">
                Plataforma
              </label>

              <select
                id="platform"
                value={platform}
                onChange={(event) =>
                  setPlatform(event.target.value)
                }
              >
                <option value="PC">PC</option>
                <option value="PlayStation">
                  PlayStation
                </option>
                <option value="Xbox">Xbox</option>
                <option value="Nintendo">
                  Nintendo
                </option>
                <option value="Outra">Outra</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as GameStatus
                  )
                }
              >
                <option value="Jogando">
                  Jogando
                </option>
                <option value="Zerado">
                  Zerado
                </option>
                <option value="Quero jogar">
                  Quero jogar
                </option>
                <option value="Pausado">
                  Pausado
                </option>
                <option value="Abandonado">
                  Abandonado
                </option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hoursPlayed">
                Horas jogadas
              </label>

              <input
                type="number"
                id="hoursPlayed"
                min="0"
                value={hoursPlayed}
                onChange={(event) =>
                  setHoursPlayed(event.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="timesCompleted">
                Vezes zerado
              </label>

              <input
                type="number"
                id="timesCompleted"
                min="0"
                value={timesCompleted}
                onChange={(event) =>
                  setTimesCompleted(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="achievements">
              Conquistas
            </label>

            <input
              type="number"
              id="achievements"
              min="0"
              value={achievements}
              onChange={(event) =>
                setAchievements(event.target.value)
              }
            />
          </div>

          <div className="edit-form-actions">
            <button
              type="button"
              className="edit-cancel-button"
              onClick={() =>
                navigate(`/jogo/${game.id}`)
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="add-game-button"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Salvando...'
                : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default EditGame