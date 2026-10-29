import { ArrowRight, Clock3, Gamepad2, Heart, Plus, Search, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGameImage } from '../../data/gameImage'
import { getGames, updateGame } from '../../services/gameApi'
import type { Game } from '../../types/games'
import './Library.css'

function Library() {
  const navigate = useNavigate()
  const [games, setGames] = useState<Game[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState<Game['id'] | null>(null)

  useEffect(() => {
    let active = true
    async function loadGames() {
      try {
        const apiGames = await getGames()
        if (active) {
          setGames(apiGames)
          setLoadError(false)
        }
      } catch (error) {
        console.error('Erro ao carregar jogos:', error)
        if (active) setLoadError(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadGames()
    return () => { active = false }
  }, [])

  const filteredGames = games.filter((game) =>
    game.title.toLocaleLowerCase('pt-BR').includes(searchTerm.trim().toLocaleLowerCase('pt-BR'))
  )
  const totalHours = games.reduce((sum, game) => sum + game.hoursPlayed, 0)
  const favoriteCount = games.filter((game) => game.favorite).length

  async function handleToggleFavorite(game: Game) {
    if (updatingFavoriteId !== null) return
    setUpdatingFavoriteId(game.id)
    try {
      const updatedGame = await updateGame(game.id, {
        title: game.title,
        platform: game.platform,
        hoursPlayed: game.hoursPlayed,
        timesCompleted: game.timesCompleted,
        achievements: game.achievements,
        status: game.status,
        favorite: !game.favorite,
      })
      setGames((current) => current.map((item) => item.id === updatedGame.id ? updatedGame : item))
    } catch (error) {
      console.error('Erro ao atualizar favorito:', error)
      window.alert('Não foi possível atualizar o favorito.')
    } finally {
      setUpdatingFavoriteId(null)
    }
  }

  return (
    <main className="library-page gv-library">
      <header className="gv-library-intro">
        <div className="gv-library-intro-copy">
          <span className="gv-library-eyebrow">SUA COLEÇÃO PESSOAL</span>
          <h1>Todos os jogos.<br /><span>Uma história só sua.</span></h1>
          <p>Reúna suas aventuras, acompanhe suas conquistas e revisite cada capítulo da sua trajetória gamer.</p>
        </div>
        <button type="button" className="gv-library-primary" onClick={() => navigate('/adicionar')}>
          <Plus size={17} aria-hidden="true" /> Adicionar jogo
        </button>
      </header>

      <section className="gv-library-overview" aria-label="Resumo da coleção">
        <div className="gv-library-overview-item"><Gamepad2 size={21} aria-hidden="true" /><div><strong>{games.length}</strong><span>Jogos na coleção</span></div></div>
        <div className="gv-library-overview-item"><Clock3 size={21} aria-hidden="true" /><div><strong>{totalHours.toLocaleString('pt-BR')}h</strong><span>Horas registradas</span></div></div>
        <div className="gv-library-overview-item"><Heart size={21} aria-hidden="true" /><div><strong>{favoriteCount}</strong><span>Favoritos</span></div></div>
      </section>

      <section className="gv-library-collection" aria-label="Jogos da biblioteca">
        <div className="gv-library-section-heading">
          <div><span className="gv-library-eyebrow">BIBLIOTECA</span><h2>Minha coleção<span className="gv-library-count">{games.length}</span></h2></div>
          <div className="gv-library-search">
            <Search size={18} aria-hidden="true" />
            <input type="search" aria-label="Buscar jogo pelo título" placeholder="Buscar na coleção" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
            {searchTerm && <button type="button" aria-label="Limpar busca" onClick={() => setSearchTerm('')}><X size={16} /></button>}
          </div>
        </div>

        {loading ? (
          <div className="gv-library-empty" role="status"><Gamepad2 size={28} /><h3>Carregando sua coleção...</h3><p>Estamos buscando os jogos da sua biblioteca.</p></div>
        ) : loadError ? (
          <div className="gv-library-empty" role="alert"><Gamepad2 size={28} /><h3>Não foi possível carregar os jogos</h3><p>Verifique sua conexão com a API e tente atualizar a página.</p></div>
        ) : games.length === 0 ? (
          <div className="gv-library-empty"><Gamepad2 size={28} /><h3>Sua história começa aqui.</h3><p>Adicione seu primeiro jogo para construir sua coleção pessoal.</p><button type="button" className="gv-library-primary" onClick={() => navigate('/adicionar')}>Adicionar primeiro jogo <ArrowRight size={16} /></button></div>
        ) : filteredGames.length === 0 ? (
          <div className="gv-library-empty"><Search size={28} /><h3>Nenhum jogo encontrado</h3><p>Não encontramos títulos correspondentes a “{searchTerm}”.</p><button type="button" className="gv-library-secondary" onClick={() => setSearchTerm('')}>Limpar busca</button></div>
        ) : (
          <div className="gv-library-grid">
            {filteredGames.map((game) => {
              const image = getGameImage(game.title)
              return (
                <article className="gv-library-card" key={game.id}>
                  <div className="gv-library-card-media">
                    {image ? <img src={image} alt="" loading="lazy" /> : <div className="gv-library-card-placeholder"><Gamepad2 size={34} aria-hidden="true" /><span>GAMEVAULT</span></div>}
                    <span className="gv-library-platform">{game.platform}</span>
                    <button type="button" className={`gv-library-favorite${game.favorite ? ' is-active' : ''}`} aria-label={`${game.favorite ? 'Remover' : 'Adicionar'} ${game.title} ${game.favorite ? 'dos' : 'aos'} favoritos`} aria-pressed={game.favorite} disabled={updatingFavoriteId !== null} onClick={() => void handleToggleFavorite(game)}>
                      <Heart size={19} fill={game.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="gv-library-card-body">
                    <h3>{game.title}</h3>
                    <div className="gv-library-card-metrics">
                      <span><Clock3 size={15} aria-hidden="true" />{game.hoursPlayed.toLocaleString('pt-BR')}h jogadas</span>
                      {game.timesCompleted > 0 && <span><Trophy size={15} aria-hidden="true" />Zerado {game.timesCompleted} {game.timesCompleted === 1 ? 'vez' : 'vezes'}</span>}
                    </div>
                    <button type="button" className="gv-library-details" onClick={() => navigate(`/jogo/${game.id}`)}>Ver detalhes <ArrowRight size={17} aria-hidden="true" /></button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default Library
