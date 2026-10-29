import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Gamepad2, Layers3, Pencil, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGameById, updateGame } from '../../services/gameApi'
import type { Game, GameStatus } from '../../types/games'
import '../AddGame/AddGame.css'
import './EditGame.css'

const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Outra']
const statuses: GameStatus[] = ['Quero jogar', 'Jogando', 'Zerado', 'Pausado', 'Abandonado']

function EditGame() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [game, setGame] = useState<Game | null>(null)
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [status, setStatus] = useState<GameStatus>('Quero jogar')
  const [hoursPlayed, setHoursPlayed] = useState('')
  const [timesCompleted, setTimesCompleted] = useState('')
  const [achievements, setAchievements] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    async function loadGame() {
      const gameId = Number(id)
      if (!id || !Number.isInteger(gameId) || gameId <= 0) {
        setErrorMessage('O jogo solicitado não foi encontrado.')
        setLoading(false)
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
        console.error('Erro ao carregar jogo:', error)
        if (active) setErrorMessage('Não foi possível carregar este jogo. Verifique se ele ainda existe.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadGame()
    return () => { active = false }
  }, [id])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!game || isSubmitting) return
    if (!title.trim()) {
      setErrorMessage('Informe o nome do jogo para continuar.')
      return
    }
    setErrorMessage('')
    try {
      setIsSubmitting(true)
      await updateGame(game.id, {
        title: title.trim(),
        platform,
        hoursPlayed: Number(hoursPlayed) || 0,
        timesCompleted: Number(timesCompleted) || 0,
        achievements: Number(achievements) || 0,
        status,
        favorite: game.favorite,
      })
      navigate(`/jogo/${game.id}`)
    } catch (error) {
      console.error('Erro ao atualizar jogo:', error)
      setErrorMessage('Não foi possível salvar as alterações. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || !game) {
    return (
      <main className="gv-add-page gv-edit-page">
        <div className="gv-add-shell">
          <button type="button" className="gv-add-back" onClick={() => navigate('/biblioteca')}>
            <ArrowLeft size={16} aria-hidden="true" /> Voltar à biblioteca
          </button>
          <section className="gv-edit-feedback" role={loading ? 'status' : 'alert'}>
            <span className="gv-add-icon-box"><Gamepad2 size={22} aria-hidden="true" /></span>
            <h1>{loading ? 'Carregando jogo...' : 'Não foi possível abrir o jogo'}</h1>
            {!loading && <p>{errorMessage}</p>}
            {!loading && <button type="button" className="gv-add-cancel" onClick={() => navigate('/biblioteca')}>Ir para a biblioteca</button>}
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="gv-add-page gv-edit-page">
      <div className="gv-add-shell">
        <button type="button" className="gv-add-back" onClick={() => navigate(`/jogo/${game.id}`)}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar aos detalhes
        </button>

        <header className="gv-add-heading">
          <span className="gv-add-eyebrow"><Pencil size={14} aria-hidden="true" /> SUA COLEÇÃO, SUA HISTÓRIA</span>
          <h1>Sua história, <em>seus detalhes.</em></h1>
          <p>Atualize as informações de <strong>{game.title}</strong> e mantenha sua trajetória sempre em dia.</p>
        </header>

        <div className="gv-add-layout">
          <section className="gv-add-panel" aria-labelledby="gv-edit-form-title">
            <div className="gv-add-panel-heading">
              <span className="gv-add-icon-box"><Gamepad2 size={21} aria-hidden="true" /></span>
              <div>
                <h2 id="gv-edit-form-title">Editar informações</h2>
                <p>Faça os ajustes necessários e salve quando terminar.</p>
              </div>
            </div>

            <form className="gv-add-form" onSubmit={handleSubmit}>
              <div className="gv-add-field">
                <label htmlFor="gv-edit-title">Nome do jogo <span aria-hidden="true">*</span></label>
                <input id="gv-edit-title" type="text" value={title} onChange={(event) => { setTitle(event.target.value); if (errorMessage) setErrorMessage('') }} maxLength={200} required />
              </div>

              <div className="gv-add-fields-two">
                <div className="gv-add-field">
                  <label htmlFor="gv-edit-platform">Plataforma</label>
                  <select id="gv-edit-platform" value={platform} onChange={(event) => setPlatform(event.target.value)}>
                    {!platforms.includes(platform) && <option value={platform}>{platform}</option>}
                    {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-edit-status">Status</label>
                  <select id="gv-edit-status" value={status} onChange={(event) => setStatus(event.target.value as GameStatus)}>
                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="gv-add-divider"><span>SEU PROGRESSO</span></div>

              <div className="gv-add-fields-three">
                <div className="gv-add-field">
                  <label htmlFor="gv-edit-hours"><Clock3 size={15} aria-hidden="true" /> Horas jogadas</label>
                  <input id="gv-edit-hours" type="number" min="0" step="1" value={hoursPlayed} onChange={(event) => setHoursPlayed(event.target.value)} />
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-edit-completed"><Check size={15} aria-hidden="true" /> Vezes zerado</label>
                  <input id="gv-edit-completed" type="number" min="0" step="1" value={timesCompleted} onChange={(event) => setTimesCompleted(event.target.value)} />
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-edit-achievements"><Trophy size={15} aria-hidden="true" /> Conquistas</label>
                  <input id="gv-edit-achievements" type="number" min="0" step="1" value={achievements} onChange={(event) => setAchievements(event.target.value)} />
                </div>
              </div>

              {errorMessage && <p className="gv-add-error" role="alert">{errorMessage}</p>}

              <div className="gv-add-actions">
                <button type="button" className="gv-add-cancel" onClick={() => navigate(`/jogo/${game.id}`)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="gv-add-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                  {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </section>

          <aside className="gv-add-aside" aria-label="Sobre sua coleção">
            <div className="gv-add-aside-art"><Layers3 size={38} strokeWidth={1.2} aria-hidden="true" /></div>
            <span className="gv-add-aside-kicker">GAMEVAULT / SUA TRAJETÓRIA</span>
            <h2>Uma coleção que evolui com você.</h2>
            <p>Atualize suas horas, conquistas e experiências. Cada detalhe faz parte da história que você está construindo.</p>
            <div className="gv-add-aside-footer"><BookOpen size={17} aria-hidden="true" /> Seus jogos. Suas histórias. Sua trajetória.</div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default EditGame
