import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Gamepad2, Layers3, Sparkles, Trophy } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGame } from '../../services/gameApi'
import type { GameStatus } from '../../types/games'
import './AddGame.css'

const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Outra']
const statuses: GameStatus[] = ['Quero jogar', 'Jogando', 'Zerado', 'Pausado', 'Abandonado']

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return
    if (!title.trim()) {
      setErrorMessage('Informe o nome do jogo para continuar.')
      return
    }
    setErrorMessage('')
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
      setErrorMessage('Não foi possível cadastrar o jogo. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="gv-add-page">
      <div className="gv-add-shell">
        <button type="button" className="gv-add-back" onClick={() => navigate('/biblioteca')}>
          <ArrowLeft size={16} aria-hidden="true" /> Voltar à biblioteca
        </button>

        <header className="gv-add-heading">
          <span className="gv-add-eyebrow"><Sparkles size={14} aria-hidden="true" /> SUA COLEÇÃO, SUA HISTÓRIA</span>
          <h1>Uma nova história <em>começa aqui.</em></h1>
          <p>Adicione um jogo à sua biblioteca e registre os momentos que fazem parte da sua trajetória.</p>
        </header>

        <div className="gv-add-layout">
          <section className="gv-add-panel" aria-labelledby="gv-add-form-title">
            <div className="gv-add-panel-heading">
              <span className="gv-add-icon-box"><Gamepad2 size={21} aria-hidden="true" /></span>
              <div>
                <h2 id="gv-add-form-title">Informações do jogo</h2>
                <p>Comece pelo essencial. Você poderá editar os dados depois.</p>
              </div>
            </div>

            <form className="gv-add-form" onSubmit={handleSubmit}>
              <div className="gv-add-field">
                <label htmlFor="gv-add-title">Nome do jogo <span aria-hidden="true">*</span></label>
                <input id="gv-add-title" type="text" value={title} onChange={(event) => { setTitle(event.target.value); if (errorMessage) setErrorMessage('') }} placeholder="Ex.: Red Dead Redemption 2" maxLength={200} required autoFocus />
              </div>

              <div className="gv-add-fields-two">
                <div className="gv-add-field">
                  <label htmlFor="gv-add-platform">Plataforma</label>
                  <select id="gv-add-platform" value={platform} onChange={(event) => setPlatform(event.target.value)}>
                    {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-add-status">Status</label>
                  <select id="gv-add-status" value={status} onChange={(event) => setStatus(event.target.value as GameStatus)}>
                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              <div className="gv-add-divider"><span>SEU PROGRESSO</span></div>

              <div className="gv-add-fields-three">
                <div className="gv-add-field">
                  <label htmlFor="gv-add-hours"><Clock3 size={15} aria-hidden="true" /> Horas jogadas</label>
                  <input id="gv-add-hours" type="number" min="0" step="1" value={hoursPlayed} onChange={(event) => setHoursPlayed(event.target.value)} placeholder="0" />
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-add-completed"><Check size={15} aria-hidden="true" /> Vezes zerado</label>
                  <input id="gv-add-completed" type="number" min="0" step="1" value={timesCompleted} onChange={(event) => setTimesCompleted(event.target.value)} placeholder="0" />
                </div>
                <div className="gv-add-field">
                  <label htmlFor="gv-add-achievements"><Trophy size={15} aria-hidden="true" /> Conquistas</label>
                  <input id="gv-add-achievements" type="number" min="0" step="1" value={achievements} onChange={(event) => setAchievements(event.target.value)} placeholder="0" />
                </div>
              </div>

              {errorMessage && <p className="gv-add-error" role="alert">{errorMessage}</p>}

              <div className="gv-add-actions">
                <button type="button" className="gv-add-cancel" onClick={() => navigate('/biblioteca')} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="gv-add-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adicionando...' : 'Adicionar à biblioteca'}
                  {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </section>

          <aside className="gv-add-aside" aria-label="Sobre sua coleção">
            <div className="gv-add-aside-art"><Layers3 size={38} strokeWidth={1.2} aria-hidden="true" /></div>
            <span className="gv-add-aside-kicker">GAMEVAULT / SUA TRAJETÓRIA</span>
            <h2>Mais que uma lista de jogos.</h2>
            <p>Cada título representa horas de descobertas, desafios e conquistas. Guarde tudo em um só lugar.</p>
            <div className="gv-add-aside-footer"><BookOpen size={17} aria-hidden="true" /> Seus jogos. Suas histórias. Sua trajetória.</div>
          </aside>
        </div>
      </div>
    </main>
  )
}

export default AddGame
