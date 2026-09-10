import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { addGame } from '../../data/gameStorage'

function AddGame() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Digite o nome do jogo.')
      return
    }

    const newGame = {
      id: Date.now(),
      title: title.trim(),
      hoursPlayed: Number(hoursPlayed) || 0,
      timesCompleted: Number(timesCompleted) || 0,
      achievements: Number(achievements) || 0,
    }

    addGame(newGame)

    setTitle('')
    setHoursPlayed('')
    setTimesCompleted('')
    setAchievements('')

    navigate('/biblioteca')
  }

  return (
    <main className="add-game-page">
      <header className="add-game-header">
        <div>
          <h1>Adicionar jogo</h1>
          <p>Cadastre um novo jogo na sua biblioteca.</p>
        </div>
      </header>

      <section className="add-game-card">
        <form className="add-game-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Nome do jogo</label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Red Dead Redemption 2"
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
                placeholder="0"
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
                placeholder="0"
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
              placeholder="0"
            />
          </div>

          <button
            type="submit"
            className="add-game-button"
          >
            Adicionar à biblioteca
          </button>
        </form>
      </section>
    </main>
  )
}

export default AddGame