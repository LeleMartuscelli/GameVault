
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Gamepad2,
  Layers3,
  Pencil,
  Trophy,
} from 'lucide-react'

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

import '../AddGame/AddGame.css'
import './EditGame.css'

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

function EditGame() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [game, setGame] = useState<Game | null>(null)

  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('PC')

  const [status, setStatus] =
    useState<GameStatus>('Quero jogar')

  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadGame() {
      setLoading(true)
      setLoadError('')
      setErrorMessage('')
      setGame(null)

      const gameId = Number(id)

      if (
        !id ||
        !Number.isSafeInteger(gameId) ||
        gameId <= 0
      ) {
        if (active) {
          setLoadError(
            'O jogo solicitado não foi encontrado.'
          )
          setLoading(false)
        }

        return
      }

      try {
        const apiGame = await getGameById(gameId)

        if (!active) return

        setGame(apiGame)

        setTitle(apiGame.title)
        setPlatform(apiGame.platform)
        setStatus(apiGame.status)

        setHoursPlayed(String(apiGame.hoursPlayed))
        setTimesCompleted(String(apiGame.timesCompleted))
        setAchievements(String(apiGame.achievements))
      } catch (error) {
        console.error(
          'Erro ao carregar jogo:',
          error
        )

        if (active) {
          setLoadError(
            'Não foi possível carregar este jogo. Verifique sua conexão ou se ele ainda existe.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadGame()

    return () => {
      active = false
    }
  }, [id])

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!game || isSubmitting) return

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
      await updateGame(game.id, {
        title: normalizedTitle,
        platform,
        hoursPlayed: parsedHours,
        timesCompleted: parsedCompleted,
        achievements: parsedAchievements,
        status,

        // Preserva o favorito existente.
        favorite: game.favorite,
      })

      navigate(`/jogo/${game.id}`)
    } catch (error) {
      console.error(
        'Erro ao atualizar jogo:',
        error
      )

      setErrorMessage(
        'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    if (!game || isSubmitting) return

    navigate(`/jogo/${game.id}`)
  }

  if (loading || !game) {
    return (
      <main className="gv-add-page gv-edit-page">
        <div className="gv-add-shell">

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

          <section
            className="gv-edit-feedback"
            role={loading ? 'status' : 'alert'}
          >
            <span className="gv-add-icon-box">
              <Gamepad2
                size={22}
                aria-hidden="true"
              />
            </span>

            <h1>
              {loading
                ? 'Carregando jogo...'
                : 'Não foi possível abrir o jogo'}
            </h1>

            {!loading && (
              <>
                <p>{loadError}</p>

                <button
                  type="button"
                  className="gv-add-cancel"
                  onClick={() => navigate('/biblioteca')}
                >
                  Ir para a biblioteca
                </button>
              </>
            )}
          </section>

        </div>
      </main>
    )
  }

  return (
    <main className="gv-add-page gv-edit-page">
      <div className="gv-add-shell">

        {/* NAVEGAÇÃO */}

        <button
          type="button"
          className="gv-add-back"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          <ArrowLeft
            size={16}
            aria-hidden="true"
          />

          Voltar aos detalhes
        </button>

        {/* CABEÇALHO */}

        <header className="gv-add-heading">

          <span className="gv-add-eyebrow">
            <Pencil
              size={14}
              aria-hidden="true"
            />

            SUA COLEÇÃO, SUA HISTÓRIA
          </span>

          <h1>
            Sua história,{' '}
            <em>seus detalhes.</em>
          </h1>

          <p>
            Atualize as informações de{' '}
            <strong>{game.title}</strong> e mantenha
            sua trajetória sempre em dia.
          </p>

        </header>

        {/* CONTEÚDO */}

        <div className="gv-add-layout">

          {/* FORMULÁRIO */}

          <section
            className="gv-add-panel"
            aria-labelledby="gv-edit-form-title"
          >

            <div className="gv-add-panel-heading">

              <span className="gv-add-icon-box">
                <Gamepad2
                  size={21}
                  aria-hidden="true"
                />
              </span>

              <div>
                <h2 id="gv-edit-form-title">
                  Editar informações
                </h2>

                <p>
                  Faça os ajustes necessários e
                  salve quando terminar.
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
                <label htmlFor="gv-edit-title">
                  Nome do jogo
                  <span aria-hidden="true">*</span>
                </label>

                <input
                  id="gv-edit-title"
                  type="text"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value)
                    setErrorMessage('')
                  }}
                  maxLength={200}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* PLATAFORMA E STATUS */}

              <div className="gv-add-fields-two">

                <div className="gv-add-field">
                  <label htmlFor="gv-edit-platform">
                    Plataforma
                  </label>

                  <select
                    id="gv-edit-platform"
                    value={platform}
                    onChange={(event) => {
                      setPlatform(event.target.value)
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                  >
                    {!platforms.includes(platform) && (
                      <option value={platform}>
                        {platform}
                      </option>
                    )}

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
                  <label htmlFor="gv-edit-status">
                    Status
                  </label>

                  <select
                    id="gv-edit-status"
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

              {/* PROGRESSO */}

              <div className="gv-add-divider">
                <span>SEU PROGRESSO</span>
              </div>

              <div className="gv-add-fields-three">

                <div className="gv-add-field">
                  <label htmlFor="gv-edit-hours">
                    <Clock3
                      size={15}
                      aria-hidden="true"
                    />

                    Horas jogadas
                  </label>

                  <input
                    id="gv-edit-hours"
                    type="number"
                    min="0"
                    step="1"
                    value={hoursPlayed}
                    onChange={(event) => {
                      setHoursPlayed(event.target.value)
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="gv-add-field">
                  <label htmlFor="gv-edit-completed">
                    <Check
                      size={15}
                      aria-hidden="true"
                    />

                    Vezes zerado
                  </label>

                  <input
                    id="gv-edit-completed"
                    type="number"
                    min="0"
                    step="1"
                    value={timesCompleted}
                    onChange={(event) => {
                      setTimesCompleted(event.target.value)
                      setErrorMessage('')
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="gv-add-field">
                  <label htmlFor="gv-edit-achievements">
                    <Trophy
                      size={15}
                      aria-hidden="true"
                    />

                    Conquistas
                  </label>

                  <input
                    id="gv-edit-achievements"
                    type="number"
                    min="0"
                    step="1"
                    value={achievements}
                    onChange={(event) => {
                      setAchievements(event.target.value)
                      setErrorMessage('')
                    }}
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

              {/* AÇÕES */}

              <div className="gv-add-actions">

                <button
                  type="button"
                  className="gv-add-cancel"
                  onClick={handleCancel}
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
                    ? 'Salvando...'
                    : 'Salvar alterações'}

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
              Uma coleção que evolui com você.
            </h2>

            <p>
              Atualize suas horas, conquistas
              e experiências. Cada detalhe faz
              parte da história que você está
              construindo.
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

export default EditGame
