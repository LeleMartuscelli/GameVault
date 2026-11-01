
import {
  ArrowLeft,
  ArrowUpRight,
  Clock3,
  Gamepad2,
  Heart,
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
  updateGame,
} from '../../services/gameApi'
import type { Game } from '../../types/games'

import './GameDetails.css'

type GameLoadState = {
  id: string | undefined
  game: Game | null
  error: string
}

function GameDetails() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [gameState, setGameState] = useState<GameLoadState>({
    id: undefined,
    game: null,
    error: '',
  })

  const [deleting, setDeleting] = useState(false)
  const [savingFavorite, setSavingFavorite] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let active = true
    const gameId = Number(id)

    if (!id || !Number.isInteger(gameId) || gameId <= 0) {
      return () => {
        active = false
      }
    }

    async function loadGame() {
      try {
        const apiGame = await getGameById(gameId)

        if (active) {
          setGameState({
            id,
            game: apiGame,
            error: '',
          })
        }
      } catch (error) {
        console.error('Erro ao carregar jogo:', error)

        if (active) {
          setGameState({
            id,
            game: null,
            error: 'Não foi possível carregar este jogo.',
          })
        }
      }
    }

    void loadGame()

    return () => {
      active = false
    }
  }, [id])

  const gameId = Number(id)
  const validId =
    Boolean(id) &&
    Number.isInteger(gameId) &&
    gameId > 0

  const loading =
    validId &&
    gameState.id !== id

  const game =
    validId && gameState.id === id
      ? gameState.game
      : null

  const loadError = !validId
    ? 'Jogo não encontrado.'
    : gameState.id === id
      ? gameState.error
      : ''

  async function handleFavorite() {
    if (!game || savingFavorite || deleting) return

    try {
      setSavingFavorite(true)
      setActionError('')

      const updated = await updateGame(game.id, {
        title: game.title,
        platform: game.platform,
        hoursPlayed: game.hoursPlayed,
        timesCompleted: game.timesCompleted,
        achievements: game.achievements,
        status: game.status,
        favorite: !game.favorite,
      })

      setGameState((previous) => {
        if (previous.id !== id) return previous

        return {
          ...previous,
          game: updated,
        }
      })
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      setActionError(
        'Não foi possível atualizar o favorito. Tente novamente.'
      )
    } finally {
      setSavingFavorite(false)
    }
  }

  async function handleDelete() {
    if (!game || deleting || savingFavorite) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${game.title}" da biblioteca?`
    )

    if (!confirmed) return

    try {
      setDeleting(true)
      setActionError('')

      await deleteGame(game.id)

      navigate('/biblioteca')
    } catch (error) {
      console.error('Erro ao excluir jogo:', error)
      setActionError(
        'Não foi possível excluir o jogo. Tente novamente.'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main className="gv-detail-page">
        <div className="gv-detail-feedback" role="status">
          <div className="gv-detail-feedback-icon">
            <Gamepad2 size={30} strokeWidth={1.5} />
          </div>

          <span className="gv-detail-kicker">
            SUA BIBLIOTECA
          </span>

          <h1>Carregando sua história...</h1>

          <p>
            Estamos preparando os detalhes do seu jogo.
          </p>
        </div>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="gv-detail-page">
        <div className="gv-detail-feedback">
          <div className="gv-detail-feedback-icon">
            <Gamepad2 size={30} strokeWidth={1.5} />
          </div>

          <span className="gv-detail-kicker">
            GAMEVAULT
          </span>

          <h1>Jogo indisponível</h1>

          <p>
            {loadError ||
              'Não encontramos este jogo na sua biblioteca.'}
          </p>

          <button
            type="button"
            className="gv-detail-primary"
            onClick={() => navigate('/biblioteca')}
          >
            <ArrowLeft size={17} />
            Voltar à biblioteca
          </button>
        </div>
      </main>
    )
  }

  const gameImage = getGameImage(game.title)

  return (
    <main className="gv-detail-page">
      {/* NAVEGAÇÃO SUPERIOR */}

      <div className="gv-detail-topbar">
        <button
          type="button"
          className="gv-detail-back"
          onClick={() => navigate('/biblioteca')}
        >
          <ArrowLeft size={17} />
          Voltar à biblioteca
        </button>

        <span className="gv-detail-breadcrumb">
          GAMEVAULT
          <span className="gv-detail-breadcrumb-separator">
            /
          </span>
          SUA COLEÇÃO
          <span className="gv-detail-breadcrumb-separator">
            /
          </span>
          DETALHES
        </span>
      </div>

      {/* HERO CINEMATOGRÁFICO */}

      <section
        className={`gv-detail-hero${
          gameImage ? '' : ' gv-detail-hero--no-image'
        }`}
        aria-label={`Detalhes de ${game.title}`}
      >
        {gameImage ? (
          <img
            src={gameImage}
            alt={`Arte do jogo ${game.title}`}
            className="gv-detail-hero-image"
          />
        ) : (
          <div
            className="gv-detail-hero-placeholder"
            aria-hidden="true"
          >
            <Gamepad2 size={100} strokeWidth={0.8} />
          </div>
        )}

        <div
          className="gv-detail-hero-shade"
          aria-hidden="true"
        />

        <div className="gv-detail-hero-content">
          <div className="gv-detail-hero-topline">
            <span className="gv-detail-hero-line" />

            <span className="gv-detail-eyebrow">
              UM CAPÍTULO DA SUA HISTÓRIA
            </span>
          </div>

          <h1>{game.title}</h1>

          <div className="gv-detail-hero-bottom">
            <div className="gv-detail-tags">
              <span>
                <Gamepad2 size={15} />
                {game.platform}
              </span>

              <span className="gv-detail-status">
                <span
                  className="gv-detail-status-dot"
                  aria-hidden="true"
                />
                {game.status}
              </span>
            </div>

            <span className="gv-detail-hero-caption">
              SEUS JOGOS. SUAS HISTÓRIAS.
            </span>
          </div>
        </div>
      </section>

      {/* APRESENTAÇÃO */}

      <section className="gv-detail-intro">
        <div className="gv-detail-intro-copy">
          <span className="gv-detail-kicker">
            SUA TRAJETÓRIA
          </span>

          <h2>
            Cada hora.
            <br />
            Uma nova história.
          </h2>

          <p>
            Cada partida, cada conquista e cada momento
            fazem parte da sua jornada. Aqui, sua
            experiência se transforma em história.
          </p>
        </div>

        <button
          type="button"
          className={`gv-detail-favorite${
            game.favorite ? ' is-active' : ''
          }`}
          onClick={handleFavorite}
          disabled={savingFavorite || deleting}
          aria-pressed={game.favorite}
        >
          <Heart
            size={19}
            fill={
              game.favorite ? 'currentColor' : 'none'
            }
          />

          {savingFavorite
            ? 'Salvando...'
            : game.favorite
              ? 'Nos favoritos'
              : 'Adicionar aos favoritos'}
        </button>
      </section>

      {/* ESTATÍSTICAS */}

      <section
        className="gv-detail-stats-section"
        aria-label="Estatísticas do jogo"
      >
        <div className="gv-detail-section-heading">
          <div>
            <span className="gv-detail-kicker">
              EM NÚMEROS
            </span>

            <h2>Sua jornada até aqui.</h2>
          </div>

          <span className="gv-detail-section-index">
            01 / ESTATÍSTICAS
          </span>
        </div>

        <div className="gv-detail-stats">
          <article className="gv-detail-stat">
            <div className="gv-detail-stat-top">
              <span>01</span>
              <Clock3 size={22} strokeWidth={1.6} />
            </div>

            <div className="gv-detail-stat-content">
              <span className="gv-detail-stat-label">
                HORAS JOGADAS
              </span>

              <strong>
                {game.hoursPlayed.toLocaleString('pt-BR')}
                <small>h</small>
              </strong>

              <p>Tempo dedicado à aventura.</p>
            </div>
          </article>

          <article className="gv-detail-stat">
            <div className="gv-detail-stat-top">
              <span>02</span>
              <Trophy size={22} strokeWidth={1.6} />
            </div>

            <div className="gv-detail-stat-content">
              <span className="gv-detail-stat-label">
                VEZES CONCLUÍDO
              </span>

              <strong>{game.timesCompleted}</strong>

              <p>
                {game.timesCompleted === 1
                  ? 'Uma jornada finalizada.'
                  : 'Jornadas finalizadas.'}
              </p>
            </div>
          </article>

          <article className="gv-detail-stat">
            <div className="gv-detail-stat-top">
              <span>03</span>
              <Medal size={22} strokeWidth={1.6} />
            </div>

            <div className="gv-detail-stat-content">
              <span className="gv-detail-stat-label">
                CONQUISTAS
              </span>

              <strong>{game.achievements}</strong>

              <p>Marcos da sua trajetória.</p>
            </div>
          </article>
        </div>
      </section>

      {/* GERENCIAMENTO */}

      <section className="gv-detail-management">
        <div className="gv-detail-management-copy">
          <span className="gv-detail-kicker">
            SUA COLEÇÃO, SUAS REGRAS
          </span>

          <h2>Sua história continua.</h2>

          <p>
            Atualize seu progresso, organize seus registros
            e mantenha sua biblioteca do seu jeito.
          </p>
        </div>

        <div className="gv-detail-actions">
          <button
            type="button"
            className="gv-detail-primary"
            onClick={() =>
              navigate(`/editar/${game.id}`)
            }
            disabled={deleting || savingFavorite}
          >
            <Pencil size={17} />
            Editar informações
            <ArrowUpRight size={16} />
          </button>

          <button
            type="button"
            className="gv-detail-danger"
            onClick={handleDelete}
            disabled={deleting || savingFavorite}
          >
            <Trash2 size={17} />

            {deleting
              ? 'Excluindo...'
              : 'Excluir jogo'}
          </button>
        </div>
      </section>

      {actionError && (
        <p
          className="gv-detail-error"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {/* ASSINATURA */}

      <footer className="gv-detail-footer">
        <span>GAMEVAULT</span>
        <span>
          SEUS JOGOS. SUAS HISTÓRIAS. SUA TRAJETÓRIA.
        </span>
      </footer>
    </main>
  )
}

export default GameDetails
