import {
  ArrowLeft,
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

function GameDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [savingFavorite, setSavingFavorite] = useState(false)

  useEffect(() => {
    let active = true
    async function loadGame() {
      setLoading(true)
      setError('')
      setGame(null)
      const gameId = Number(id)
      if (!id || !Number.isInteger(gameId) || gameId <= 0) {
        setError('Jogo não encontrado.')
        setLoading(false)
        return
      }
      try {
        const apiGame = await getGameById(gameId)
        if (active) setGame(apiGame)
      } catch (err) {
        console.error('Erro ao carregar jogo:', err)
        if (active) setError('Não foi possível carregar este jogo.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadGame()
    return () => { active = false }
  }, [id])

  async function handleDelete() {
    if (!game || deleting) return
    if (!window.confirm(`Tem certeza que deseja excluir "${game.title}" da biblioteca?`)) return
    try {
      setDeleting(true)
      setError('')
      await deleteGame(game.id)
      navigate('/biblioteca')
    } catch (err) {
      console.error('Erro ao excluir jogo:', err)
      setError('Não foi possível excluir o jogo. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleFavorite() {
    if (!game || savingFavorite) return
    try {
      setSavingFavorite(true)
      setError('')
      const updated = await updateGame(game.id, {
        title: game.title,
        platform: game.platform,
        hoursPlayed: game.hoursPlayed,
        timesCompleted: game.timesCompleted,
        achievements: game.achievements,
        status: game.status,
        favorite: !game.favorite,
      })
      setGame(updated)
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
      setError('Não foi possível atualizar o favorito.')
    } finally {
      setSavingFavorite(false)
    }
  }

  if (loading) {
    return (
      <main className="gv-detail-page">
        <div className="gv-detail-feedback" role="status">
          <Gamepad2 size={30} />
          <h1>Carregando sua história...</h1>
          <p>Estamos buscando os detalhes do jogo.</p>
        </div>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="gv-detail-page">
        <div className="gv-detail-feedback">
          <Gamepad2 size={30} />
          <h1>Jogo indisponível</h1>
          <p>{error || 'Não encontramos este jogo na sua biblioteca.'}</p>
          <button type="button" className="gv-detail-primary" onClick={() => navigate('/biblioteca')}>
            <ArrowLeft size={17} /> Voltar à biblioteca
          </button>
        </div>
      </main>
    )
  }

  const gameImage = getGameImage(game.title)

  return (
    <main className="gv-detail-page">
      <div className="gv-detail-topbar">
        <button type="button" className="gv-detail-back" onClick={() => navigate('/biblioteca')}>
          <ArrowLeft size={17} /> Biblioteca
        </button>
        <span className="gv-detail-breadcrumb">SUA COLEÇÃO / DETALHES</span>
      </div>

      <section className={`gv-detail-hero${gameImage ? '' : ' gv-detail-hero--no-image'}`}>
        {gameImage ? (
          <img src={gameImage} alt={`Arte de ${game.title}`} className="gv-detail-hero-image" />
        ) : (
          <div className="gv-detail-hero-placeholder" aria-hidden="true"><Gamepad2 size={90} strokeWidth={1} /></div>
        )}
        <div className="gv-detail-hero-shade" />
        <div className="gv-detail-hero-content">
          <span className="gv-detail-eyebrow">UM CAPÍTULO DA SUA HISTÓRIA</span>
          <h1>{game.title}</h1>
          <div className="gv-detail-tags">
            <span><Gamepad2 size={14} /> {game.platform}</span>
            <span>{game.status}</span>
          </div>
        </div>
      </section>

      <section className="gv-detail-intro">
        <div>
          <span className="gv-detail-kicker">SEU REGISTRO</span>
          <h2>Cada hora faz parte da jornada.</h2>
          <p>Suas conquistas, seu tempo e os momentos que marcaram este jogo, reunidos em um só lugar.</p>
        </div>
        <button
          type="button"
          className={`gv-detail-favorite${game.favorite ? ' is-active' : ''}`}
          onClick={handleFavorite}
          disabled={savingFavorite}
          aria-pressed={game.favorite}
        >
          <Heart size={18} fill={game.favorite ? 'currentColor' : 'none'} />
          {savingFavorite ? 'Salvando...' : game.favorite ? 'Nos favoritos' : 'Adicionar aos favoritos'}
        </button>
      </section>

      <section className="gv-detail-stats" aria-label="Estatísticas do jogo">
        <article className="gv-detail-stat">
          <Clock3 size={22} />
          <span>HORAS JOGADAS</span>
          <strong>{game.hoursPlayed.toLocaleString('pt-BR')}<small>h</small></strong>
          <p>Tempo dedicado à aventura</p>
        </article>
        <article className="gv-detail-stat">
          <Trophy size={22} />
          <span>VEZES CONCLUÍDO</span>
          <strong>{game.timesCompleted}</strong>
          <p>{game.timesCompleted === 1 ? 'Uma jornada finalizada' : 'Jornadas finalizadas'}</p>
        </article>
        <article className="gv-detail-stat">
          <Medal size={22} />
          <span>CONQUISTAS</span>
          <strong>{game.achievements}</strong>
          <p>Marcos da sua trajetória</p>
        </article>
      </section>

      <section className="gv-detail-management">
        <div>
          <span className="gv-detail-kicker">GERENCIAR REGISTRO</span>
          <h2>Sua história, do seu jeito.</h2>
          <p>Atualize o progresso ou organize os jogos da sua coleção.</p>
        </div>
        <div className="gv-detail-actions">
          <button type="button" className="gv-detail-primary" onClick={() => navigate(`/editar/${game.id}`)}>
            <Pencil size={17} /> Editar informações
          </button>
          <button type="button" className="gv-detail-danger" onClick={handleDelete} disabled={deleting}>
            <Trash2 size={17} /> {deleting ? 'Excluindo...' : 'Excluir jogo'}
          </button>
        </div>
      </section>
      {error && <p className="gv-detail-error" role="alert">{error}</p>}
    </main>
  )
}

export default GameDetails
