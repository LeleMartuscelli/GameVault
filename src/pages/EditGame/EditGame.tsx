import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  findGameById,
  updateGame,
} from '../../data/gameStorage'

function EditGame() {
  const navigate = useNavigate()
  const { id } = useParams()

  const game = id
    ? findGameById(id)
    : undefined

  const [title, setTitle] = useState(
    game?.title ?? ''
  )

  const [hoursPlayed, setHoursPlayed] = useState(
    game ? String(game.hoursPlayed) : ''
  )

  const [timesCompleted, setTimesCompleted] = useState(
    game ? String(game.timesCompleted) : ''
  )

  const [achievements, setAchievements] = useState(
    game ? String(game.achievements) : ''
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!game) {
      return
    }

    if (!title.trim()) {
      alert('Digite o nome do jogo.')
      return
    }

    const updatedGame = {
      ...game,
      title: title.trim(),
      hoursPlayed: Number(hoursPlayed) || 0,
      timesCompleted: Number(timesCompleted) || 0,
      achievements: Number(achievements) || 0,
    }

    updateGame(updatedGame)

    navigate(`/jogo/${game.id}`)
  }

  if (!game) {
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
                  setTimesCompleted(event.target.value)
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
            >
              Salvar alterações
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

export default EditGame