
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
import { useLocation, useNavigate } from 'react-router-dom'

import { createGame, getGames } from '../../services/gameApi'
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

type ImportedGame = {
  source?: 'rawg' | 'igdb'
  id: number
  title: string
  platforms: string[]
  imageUrl?: string | null
  backgroundImage?: string | null
}

function getSuggestedPlatform(names: string[]): string {
  if (names.some((name) => /\bPC\b|Windows/i.test(name))) {
    return 'PC'
  }

  if (names.some((name) => /PlayStation/i.test(name))) {
    return 'PlayStation'
  }

  if (names.some((name) => /Xbox/i.test(name))) {
    return 'Xbox'
  }

  if (names.some((name) => /Nintendo|Switch/i.test(name))) {
    return 'Nintendo'
  }

  return 'Outra'
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('pt-BR')
}

function parseNonNegativeInteger(
  value: string,
  fieldName: string
): number {
  if (value.trim() === '') return 0

  const number = Number(value)

  if (!Number.isSafeInteger(number) || number < 0) {
    throw new Error(
      `${fieldName} deve ser um número inteiro maior ou igual a zero.`
    )
  }

  return number
}

function AddGame() {
  const navigate = useNavigate()
  const location = useLocation()

  // Compatível com a navegação existente do Explore.
  const importedGame = (
    location.state as { rawgImport?: ImportedGame } | null
  )?.rawgImport

  const importedTitle =
    typeof importedGame?.title === 'string'
      ? importedGame.title
      : ''

  const [title, setTitle] = useState(importedTitle)

  const [platform, setPlatform] = useState(
    importedGame
      ? getSuggestedPlatform(importedGame.platforms ?? [])
      : 'PC'
  )

  const [status, setStatus] = useState<GameStatus>(
    'Quero jogar'
  )

  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')

  // Personalização
  const [favorite, setFavorite] = useState(false)
  const [showOnHome, setShowOnHome] = useState(true)
  const [isHero, setIsHero] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const backPath = importedGame
    ? '/explorar'
    : '/biblioteca'

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
      const existingGames = await getGames()

      // Impede duplicatas por título ou ID de catálogo
      // considerando a mesma plataforma.
      const alreadyExists = existingGames.some((game) => {
        const samePlatform =
          normalizeText(game.platform) ===
          normalizeText(platform)

        const sameTitle =
          normalizeText(game.title) ===
          normalizeText(normalizedTitle)

        const sameRawgId =
          !!importedGame &&
          importedGame.source !== 'igdb' &&
          Number.isSafeInteger(importedGame.id) &&
          importedGame.id > 0 &&
          game.rawgId === importedGame.id

        const sameIgdbId =
          importedGame?.source === 'igdb' &&
          Number.isSafeInteger(importedGame.id) &&
          importedGame.id > 0 &&
          game.igdbId === importedGame.id

        return samePlatform && (
          sameTitle ||
          sameRawgId ||
          sameIgdbId
        )
      })

      if (alreadyExists) {
        setErrorMessage(
          'Esse jogo já está cadastrado nessa plataforma. Abra a Biblioteca para editá-lo.'
        )
        return
      }

      // Cada API utiliza seu próprio identificador.
      const validRawgId =
        importedGame?.source !== 'igdb' &&
        importedGame &&
        Number.isSafeInteger(importedGame.id) &&
        importedGame.id > 0
          ? importedGame.id
          : null

      const validIgdbId =
        importedGame?.source === 'igdb' &&
        Number.isSafeInteger(importedGame.id) &&
        importedGame.id > 0
          ? importedGame.id
          : null

      // Preserva a capa recebida do catálogo.
      const importedImage =
        importedGame?.imageUrl ??
        importedGame?.backgroundImage ??
        null

      await createGame({
        title: normalizedTitle,
        platform,
        hoursPlayed: parsedHours,
        timesCompleted: parsedCompleted,
        achievements: parsedAchievements,
        status,
        favorite,
        rawgId: validRawgId,
        igdbId: validIgdbId,
        imageUrl: importedImage,
        showOnHome,
        isHero,
      })

      navigate('/biblioteca')
    } catch (error) {
      console.error('Erro ao cadastrar jogo:', error)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar o jogo. Tente novamente.'
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
          onClick={() => navigate(backPath)}
        >
          <ArrowLeft size={16} aria-hidden="true" />

          {importedGame
            ? 'Voltar ao Explorar'
            : 'Voltar à biblioteca'}
        </button>

        {/* CABEÇALHO */}

        <header className="gv-add-heading">
          <span className="gv-add-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
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
          <section
            className="gv-add-panel"
            aria-labelledby="gv-add-form-title"
          >
            <div className="gv-add-panel-heading">
              <span className="gv-add-icon-box">
                <Gamepad2 size={21} aria-hidden="true" />
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
                      <option key={item} value={item}>
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
                      <option key={item} value={item}>
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
                  <label htmlFor="gv-add-hours">
                    <Clock3 size={15} aria-hidden="true" />
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
                    <Check size={15} aria-hidden="true" />
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
                    <Trophy size={15} aria-hidden="true" />
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

              {/* PERSONALIZAÇÃO */}

              <div className="gv-add-divider">
                <span>PERSONALIZAÇÃO</span>
              </div>

              <div className="gv-add-field">
                <label
                  htmlFor="gv-add-favorite"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    id="gv-add-favorite"
                    type="checkbox"
                    checked={favorite}
                    onChange={(event) => {
                      setFavorite(event.target.checked)
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                  />

                  Adicionar aos meus favoritos
                </label>
              </div>

              <div className="gv-add-field">
                <label
                  htmlFor="gv-add-home"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    id="gv-add-home"
                    type="checkbox"
                    checked={showOnHome}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setShowOnHome(checked)

                      if (!checked) {
                        setIsHero(false)
                      }
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                  />

                  Mostrar no carrossel do Início
                </label>
              </div>

              <div className="gv-add-field">
                <label
                  htmlFor="gv-add-hero"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    id="gv-add-hero"
                    type="checkbox"
                    checked={isHero}
                    onChange={(event) => {
                      const checked = event.target.checked
                      setIsHero(checked)

                      if (checked) {
                        setShowOnHome(true)
                      }
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                  />

                  Definir como banner principal
                </label>
              </div>

              {isHero && (
                <p
                  style={{
                    fontSize: '13px',
                    opacity: 0.7,
                    marginTop: '4px',
                  }}
                >
                  Este jogo substituirá o destaque
                  principal configurado anteriormente.
                </p>
              )}

              {/* ERROS */}

              {errorMessage && (
                <p className="gv-add-error" role="alert">
                  {errorMessage}
                </p>
              )}

              {/* BOTÕES */}

              <div className="gv-add-actions">
                <button
                  type="button"
                  className="gv-add-cancel"
                  onClick={() => navigate(backPath)}
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
