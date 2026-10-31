
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Gamepad2,
  Layers3,
  Sparkles,
  Trophy,
} from 'lucide-react'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { createGame } from '../../services/gameApi'
import type { GameStatus } from '../../types/games'

import './AddGame.css'

const platforms = [
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo',
  'Outra',
]

const statuses: GameStatus[] = [
  'Quero jogar',
  'Jogando',
  'Zerado',
  'Pausado',
  'Abandonado',
]

function AddGame() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [status, setStatus] = useState<GameStatus>('Quero jogar')

  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  function parseNonNegativeInteger(
    value: string,
    fieldName: string
  ): number {
    if (value.trim() === '') {
      return 0
    }

    const number = Number(value)

    if (
      !Number.isSafeInteger(number) ||
      number < 0
    ) {
      throw new Error(
        `${fieldName} deve ser um número inteiro maior ou igual a zero.`
      )
    }

    return number
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (isSubmitting) return

    const normalizedTitle = title.trim()

    if (!normalizedTitle) {
      setErrorMessage(
        'Informe o nome do jogo para continuar.'
      )
      return
    }

    let parsedHours: number
    let parsedCompleted: number
    let parsedAchievements: number

    try {
      parsedHours = parseNonNegativeInteger(
        hoursPlayed,
        'Horas jogadas'
      )

      parsedCompleted = parseNonNegativeInteger(
        timesCompleted,
        'Vezes zerado'
      )

      parsedAchievements = parseNonNegativeInteger(
        achievements,
        'Conquistas'
      )
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Verifique os valores informados.'
      )
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await createGame({
        title: normalizedTitle,
        platform,
        hoursPlayed: parsedHours,
        timesCompleted: parsedCompleted,
        achievements: parsedAchievements,
        status,
        favorite: false,
      })

      navigate('/biblioteca')
    } catch (error) {
      console.error(
        'Erro ao cadastrar jogo:',
        error
      )

      setErrorMessage(
        'Não foi possível cadastrar o jogo. Verifique sua conexão e tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="gv-add-page">
      <div className="gv-add-shell">

        {/* NAVEGAÇÃO */}

        <button
          type="button"
          className="gv-add-back"
          onClick={() => navigate('/biblioteca')}
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Voltar à biblioteca
        </button>

        {/* CABEÇALHO */}

        <header className="gv-add-heading">
          <span className="gv-add-eyebrow">
            <Sparkles
              size={14}
              aria-hidden="true"
            />

            SUA COLEÇÃO, SUA HISTÓRIA
          </span>

          <h1>
            Uma nova história{' '}
            <em>começa aqui.</em>
          </h1>

          <p>
            Adicione um jogo à sua biblioteca e
            registre os momentos que fazem parte
            da sua trajetória.
          </p>
        </header>

        {/* CONTEÚDO PRINCIPAL */}

        <div className="gv-add-layout">

          {/* FORMULÁRIO */}

          <section
            className="gv-add-panel"
            aria-labelledby="gv-add-form-title"
          >
            <div className="gv-add-panel-heading">

              <span className="gv-add-icon-box">
                <Gamepad2
                  size={21}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2 id="gv-add-form-title">
                  Informações do jogo
                </h2>

                <p>
                  Comece pelo essencial. Você poderá
                  editar os dados depois.
                </p>
              </div>
            </div>

            <form
              className="gv-add-form"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >

              {/* NOME */}

              <div className="gv-add-field">
                <label htmlFor="gv-add-title">
                  Nome do jogo
                  <span aria-hidden="true">*</span>
                </label>

                <input
                  id="gv-add-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setErrorMessage('')
                  }}
                  placeholder="Ex.: Red Dead Redemption 2"
                  maxLength={200}
                  required
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              {/* PLATAFORMA E STATUS */}

              <div className="gv-add-fields-two">

                <div className="gv-add-field">
                  <label htmlFor="gv-add-platform">
                    Plataforma
                  </label>

                  <select
                    id="gv-add-platform"
                    value={platform}
                    onChange={(event) => {
                      setPlatform(event.target.value)
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                  >
                    {platforms.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="gv-add-field">
                  <label htmlFor="gv-add-status">
                    Status
                  </label>

                  <select
                    id="gv-add-status"
                    value={status}
                    onChange={(event) => {
                      setStatus(
                        event.target.value as GameStatus
                      )
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                  >
                    {statuses.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* DIVISOR */}

              <div className="gv-add-divider">
                <span>SEU PROGRESSO</span>
              </div>

              {/* PROGRESSO */}

              <div className="gv-add-fields-three">

                <div className="gv-add-field">
                  <label htmlFor="gv-add-hours">
                    <Clock3
                      size={15}
                      aria-hidden="true"
                    />
                    Horas jogadas
                  </label>

                  <input
                    id="gv-add-hours"
                    type="number"
                    min="0"
                    step="1"
                    value={hoursPlayed}
                    onChange={(event) => {
                      setHoursPlayed(event.target.value)
                      setErrorMessage('')
                    }}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="gv-add-field">
                  <label htmlFor="gv-add-completed">
                    <Check
                      size={15}
                      aria-hidden="true"
                    />
                    Vezes zerado
                  </label>

                  <input
                    id="gv-add-completed"
                    type="number"
                    min="0"
                    step="1"
                    value={timesCompleted}
                    onChange={(event) => {
                      setTimesCompleted(event.target.value)
                      setErrorMessage('')
                    }}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="gv-add-field">
                  <label htmlFor="gv-add-achievements">
                    <Trophy
                      size={15}
                      aria-hidden="true"
                    />
                    Conquistas
                  </label>

                  <input
                    id="gv-add-achievements"
                    type="number"
                    min="0"
                    step="1"
                    value={achievements}
                    onChange={(event) => {
                      setAchievements(event.target.value)
                      setErrorMessage('')
                    }}
                    placeholder="0"
                    disabled={isSubmitting}
                  />
                </div>

              </div>

              {/* ERROS */}

              {errorMessage && (
                <p
                  className="gv-add-error"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}

              {/* BOTÕES */}

              <div className="gv-add-actions">

                <button
                  type="button"
                  className="gv-add-cancel"
                  onClick={() => navigate('/biblioteca')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="gv-add-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Adicionando...'
                    : 'Adicionar à biblioteca'}

                  {!isSubmitting && (
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                    />
                  )}
                </button>

              </div>

            </form>
          </section>

          {/* PAINEL LATERAL */}

          <aside
            className="gv-add-aside"
            aria-label="Sobre sua coleção"
          >

            <div className="gv-add-aside-art">
              <Layers3
                size={38}
                strokeWidth={1.2}
                aria-hidden="true"
              />
            </div>

            <span className="gv-add-aside-kicker">
              GAMEVAULT / SUA TRAJETÓRIA
            </span>

            <h2>
              Mais que uma lista de jogos.
            </h2>

            <p>
              Cada título representa horas de
              descobertas, desafios e conquistas.
              Guarde tudo em um só lugar.
            </p>

            <div className="gv-add-aside-footer">
              <BookOpen
                size={17}
                aria-hidden="true"
              />

              Seus jogos. Suas histórias.
              Sua trajetória.
            </div>

          </aside>

        </div>
      </div>
    </main>
  )
}

export default AddGame
