import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGame } from '../../services/gameApi'
import type { GameStatus } from '../../types/games'

function AddGame() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [status, setStatus] = useState<GameStatus>('Quero jogar')
  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      alert('Digite o nome do jogo.')
      return
    }

    try {
      setIsSubmitting(true)

      await createGame({
        title: title.trim(),
        platform,
        hoursPlayed: Number(hoursPlayed) || 0,
        timesCompleted: Number(timesCompleted) || 0,
        achievements: Number(achievements) || 0,
        status,
        favorite: false,
      })

      navigate('/biblioteca')
    } catch (error) {
      console.error('Erro ao cadastrar jogo:', error)
      alert('Não foi possível cadastrar o jogo.')
    } finally {
      setIsSubmitting(false)
    }
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
              <label htmlFor="platform">Plataforma</label>

              <select
                id="platform"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="PC">PC</option>
                <option value="PlayStation">PlayStation</option>
                <option value="Xbox">Xbox</option>
                <option value="Nintendo">Nintendo</option>
                <option value="Outra">Outra</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as GameStatus)
                }
              >
                <option value="Jogando">Jogando</option>
                <option value="Zerado">Zerado</option>
                <option value="Quero jogar">Quero jogar</option>
                <option value="Pausado">Pausado</option>
                <option value="Abandonado">Abandonado</option>
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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Adicionando...'
              : 'Adicionar à biblioteca'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AddGame