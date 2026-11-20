import { useEffect, useRef, useState } from 'react'

import type { RefObject } from 'react'

import { ArrowRight, ChevronLeft, ChevronRight, Gamepad2, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

import './Explore.css'



type RawgItem = { id: number; name: string; slug: string; released: string | null; backgroundImage: string | null; rating: number; metacritic: number | null; genres: { id: number; name: string; slug: string }[]; platforms: { id: number; name: string; slug: string }[] }

type RawgDetail = RawgItem & { descriptionRaw: string; website: string | null; developers: { id: number; name: string }[]; publishers: { id: number; name: string }[] }

type SearchResponse = { count: number; hasNext: boolean; page: number; results: RawgItem[] }



// Em produção, defina VITE_API_URL com a URL pública do backend Render (sem /api no final).

// A chave RAWG_API_KEY permanece somente no servidor Express.

// Aceita VITE_API_URL tanto na raiz quanto terminando em /api/games.
// Exemplo: http://localhost:3000/api/games -> http://localhost:3000
const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_BASE = configuredApiUrl.replace(/\/+$/, '').replace(/\/api(?:\/games)?$/, '')

const GENRES = [

  { label: 'Todos', id: '' }, { label: 'Ação', id: '4' }, { label: 'Aventura', id: '3' },

  { label: 'RPG', id: '5' }, { label: 'Indie', id: '51' },

]

const PLATFORMS = [

  { label: 'Todas', id: '' }, { label: 'PC', id: '4' },

  { label: 'PlayStation', id: '187,18,16,15,27' },

  { label: 'Xbox', id: '1,186,14,80' }, { label: 'Switch', id: '7' },

]

const SORTS = [

  { label: 'Destaques', value: '-added' }, { label: 'Mais recentes', value: '-released' },

  { label: 'Mais antigos', value: 'released' }, { label: 'A–Z', value: 'name' },

  { label: 'Melhor avaliação', value: '-rating' },

]

const currentYear = new Date().getFullYear()



async function fetchApi<T>(path: string, signal: AbortSignal): Promise<T> {

  const response = await fetch(`${API_BASE}${path}`, { signal, credentials: 'include' })

  if (!response.ok) {

    let message = 'Não foi possível consultar o catálogo.'

    try { const data: { error?: string } = await response.json(); if (data.error) message = data.error } catch { /* resposta sem JSON */ }

    throw new Error(message)

  }

  return response.json() as Promise<T>

}



function Explore() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading } = useAuth()

  const catalogRef = useRef<HTMLElement>(null)

  const featuredRef = useRef<HTMLElement>(null)

  const [query, setQuery] = useState('')

  const [genre, setGenre] = useState('')

  const [platform, setPlatform] = useState('')

  const [year, setYear] = useState('')

  const [sort, setSort] = useState('-added')

  const [page, setPage] = useState(1)

  const [games, setGames] = useState<RawgItem[]>([])

  const [total, setTotal] = useState(0)

  const [hasNext, setHasNext] = useState(false)

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [retry, setRetry] = useState(0)

  const [heroIndex, setHeroIndex] = useState(0)

  const [selected, setSelected] = useState<RawgItem | null>(null)

  const [detail, setDetail] = useState<RawgDetail | null>(null)

  const [detailLoading, setDetailLoading] = useState(false)

  const [detailError, setDetailError] = useState('')



  // A busca espera a digitação terminar; alterações de filtros consultam a API imediatamente.

  useEffect(() => {

    const controller = new AbortController()

    const timer = window.setTimeout(async () => {

      setLoading(true)

      setError('')

      const params = new URLSearchParams({ page: String(page), page_size: '20', ordering: sort })

      if (query.trim()) params.set('search', query.trim())

      if (genre) params.set('genres', genre)

      if (platform) params.set('platforms', platform)

      if (year) params.set('year', year)

      try {

        const data = await fetchApi<SearchResponse>(`/api/explore/games?${params.toString()}`, controller.signal)

        if (controller.signal.aborted) return

        setGames(data.results)

        setTotal(data.count)

        setHasNext(data.hasNext)

        setHeroIndex(0)

      } catch (err) {

        if (controller.signal.aborted) return

        setGames([])

        setError(err instanceof Error ? err.message : 'Erro ao carregar jogos.')

      } finally {

        if (!controller.signal.aborted) setLoading(false)

      }

    }, query ? 400 : 0)

    return () => { window.clearTimeout(timer); controller.abort() }

  }, [query, genre, platform, year, sort, page, retry])



  // Detalhes somente ao abrir um jogo, sem consultar a API para cada card.

  useEffect(() => {

    if (!selected) return

    const controller = new AbortController()

    void fetchApi<RawgDetail>(`/api/explore/games/${selected.id}`, controller.signal)

      .then(setDetail)

      .catch((err) => { if (!controller.signal.aborted) setDetailError(err instanceof Error ? err.message : 'Falha ao carregar detalhes.') })

      .finally(() => { if (!controller.signal.aborted) setDetailLoading(false) })

    return () => controller.abort()

  }, [selected])



  function openDetails(game: RawgItem) {

    setDetail(null)

    setDetailError('')

    setDetailLoading(true)

    setSelected(game)

  }



  function closeDetails() {

    setSelected(null)

    setDetailLoading(false)

  }



  // Permite fechar a janela de detalhes com Escape.

  useEffect(() => {

    if (!selected) return

    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)

  }, [selected])



  const heroGames = games.filter((game) => Boolean(game.backgroundImage)).slice(0, 3)

  const hero = heroGames[heroIndex % Math.max(1, heroGames.length)]

  const goTo = (ref: RefObject<HTMLElement | null>) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const resetPage = (setter: (value: string) => void, value: string) => { setter(value); setPage(1) }

  const clearFilters = () => { setQuery(''); setGenre(''); setPlatform(''); setYear(''); setSort('-added'); setPage(1) }



  return (

    <main className="gv-explore">

      <section className="gv-explore-hero" aria-label="Destaque do catálogo">

        {hero?.backgroundImage && <img key={hero.id} src={hero.backgroundImage} alt="" className="gv-explore-hero-art" />}

        <div className="gv-explore-hero-wash" />

        <div className="gv-explore-hero-copy">

          <span className="gv-explore-eyebrow">EXPLORAR JOGOS</span>

          <h1>Descubra novos mundos.</h1>

          <p>Explore novos títulos, encontre histórias incríveis e expanda sua coleção.</p>

          <div className="gv-explore-hero-actions">

            <button type="button" className="gv-explore-primary" onClick={() => goTo(catalogRef)}>Explorar catálogo <ArrowRight size={17} /></button>

            <button type="button" className="gv-explore-ghost" onClick={() => goTo(featuredRef)}>Ver destaques</button>

          </div>

        </div>

        {hero && <div className="gv-explore-hero-game">{hero.name}</div>}

        {heroGames.length > 1 && <div className="gv-explore-hero-controls">

          <button type="button" aria-label="Destaque anterior" onClick={() => setHeroIndex((i) => (i + heroGames.length - 1) % heroGames.length)}><ChevronLeft size={19} /></button>

          <div className="gv-explore-hero-dots" aria-label="Destaques disponíveis">

            {heroGames.map((game, index) => <button type="button" key={game.id} className={index === heroIndex ? 'is-active' : ''} aria-label={`Mostrar destaque ${index + 1}`} aria-pressed={index === heroIndex} onClick={() => setHeroIndex(index)} />)}

          </div>

          <button type="button" aria-label="Próximo destaque" onClick={() => setHeroIndex((i) => (i + 1) % heroGames.length)}><ChevronRight size={19} /></button>

        </div>}

      </section>



      <section className="gv-explore-discovery" ref={catalogRef} aria-label="Pesquisar catálogo">

        <div className="gv-explore-filters">

          <label className="gv-explore-search"><Search size={19} /><input value={query} onChange={(event) => resetPage(setQuery, event.target.value)} placeholder="Buscar jogos por título..." aria-label="Pesquisar jogos" />{query && <button type="button" onClick={() => resetPage(setQuery, '')} aria-label="Limpar pesquisa"><X size={16} /></button>}</label>

          <label className="gv-explore-select"><span>Gênero</span><select aria-label="Filtrar por gênero" value={genre} onChange={(e) => resetPage(setGenre, e.target.value)}>{GENRES.map((g) => <option key={g.label} value={g.id}>{g.label}</option>)}</select></label>

          <label className="gv-explore-select"><span>Plataforma</span><select aria-label="Filtrar por plataforma" value={platform} onChange={(e) => resetPage(setPlatform, e.target.value)}>{PLATFORMS.map((p) => <option key={p.label} value={p.id}>{p.label}</option>)}</select></label>

          <label className="gv-explore-select"><span>Ano</span><select aria-label="Filtrar por ano" value={year} onChange={(e) => resetPage(setYear, e.target.value)}><option value="">Todos</option>{Array.from({ length: 27 }, (_, i) => currentYear + 2 - i).map((y) => <option key={y} value={y}>{y}</option>)}</select></label>

          <label className="gv-explore-select"><span>Ordenar</span><select aria-label="Ordenar jogos" value={sort} onChange={(e) => resetPage(setSort, e.target.value)}>{SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>

        </div>

        <div className="gv-explore-genres" aria-label="Categorias de jogos">{GENRES.map((g) => <button type="button" key={g.label} className={genre === g.id ? 'is-selected' : ''} aria-pressed={genre === g.id} onClick={() => resetPage(setGenre, g.id)}>{g.label === 'Todos' && <Gamepad2 size={16} />}{g.label}</button>)}</div>

      </section>



      <section className="gv-explore-section" ref={featuredRef}>

        <div className="gv-explore-section-heading"><div><span className="gv-explore-eyebrow">CATÁLOGO RAWG</span><h2>Seleção em destaque</h2><p>Jogos para conhecer e adicionar à sua coleção futuramente.</p></div><span className="gv-explore-count">{loading ? 'Buscando...' : `${total.toLocaleString('pt-BR')} resultados`}</span></div>

        {error && <div className="gv-explore-empty" role="alert">{error} <button type="button" onClick={() => setRetry((v) => v + 1)}>Tentar novamente</button></div>}

        {!error && loading && <div className="gv-explore-loading" role="status">Carregando jogos do catálogo...</div>}

        {!error && !loading && (games.length ? <>

          <div className="gv-explore-grid">{games.map((game) => <button type="button" className="gv-explore-card" key={game.id} onClick={() => openDetails(game)} aria-label={`Ver detalhes de ${game.name}`}>

            <div className="gv-explore-cover">{game.backgroundImage ? <img src={game.backgroundImage} alt="" loading="lazy" /> : <div className="gv-explore-cover-fallback"><Gamepad2 size={28} /><span>SEM CAPA</span></div>}<span className="gv-explore-card-action">Ver detalhes <ArrowRight size={15} /></span></div>

            <div className="gv-explore-card-meta"><strong>{game.name}</strong><span>{game.genres.slice(0, 2).map((g) => g.name).join(' · ') || 'Jogo'}{game.released ? ` · ${game.released.slice(0, 4)}` : ''}</span></div>

          </button>)}</div>

          <nav className="gv-explore-pagination" aria-label="Páginas do catálogo">

            <button type="button" disabled={page === 1} onClick={() => { setPage((p) => Math.max(1, p - 1)); goTo(featuredRef) }}>Anterior</button>

            <span>Página {page}</span>

            <button type="button" disabled={!hasNext} onClick={() => { setPage((p) => p + 1); goTo(featuredRef) }}>Próxima <ArrowRight size={15}/></button>

          </nav>

        </> : <div className="gv-explore-empty">Nenhum jogo encontrado com esses filtros. <button type="button" onClick={clearFilters}>Limpar filtros</button></div>)}

      </section>



      <section className="gv-explore-editorial" aria-label="Destaque editorial"><span className="gv-explore-eyebrow">DESCUBRA MAIS</span><h2>Mais do que jogar.<br />Descobrir novas histórias.</h2><p>Explore títulos fora da sua coleção e encontre sua próxima grande aventura.</p><button type="button" onClick={() => goTo(catalogRef)}>Conhecer o catálogo <ArrowRight size={17}/></button></section>

      <p className="gv-explore-demo-notice">Dados e imagens fornecidos por <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">RAWG.io</a>. A importação de jogos para sua Biblioteca será implementada na próxima etapa.</p>



      {selected && <div className="gv-explore-overlay" onClick={closeDetails}>

        <section className="gv-explore-dialog" role="dialog" aria-modal="true" aria-labelledby="gv-explore-dialog-title" onClick={(e) => e.stopPropagation()}>

          <button type="button" className="gv-explore-dialog-close" onClick={closeDetails} aria-label="Fechar detalhes"><X size={21}/></button>

          {selected.backgroundImage && <img className="gv-explore-detail-art" src={selected.backgroundImage} alt="" />}

          <span className="gv-explore-eyebrow">SOBRE O JOGO</span>

          <h2 id="gv-explore-dialog-title">{selected.name}</h2>

          {detailLoading && <p role="status">Carregando detalhes...</p>}

          {detailError && <p role="alert">{detailError}</p>}

          {detail?.descriptionRaw && <p>{detail.descriptionRaw}</p>}

          <dl>

            <div><dt>Gêneros</dt><dd>{selected.genres.map((g) => g.name).join(', ') || 'Não informado'}</dd></div>

            <div><dt>Plataformas</dt><dd>{selected.platforms.map((p) => p.name).join(', ') || 'Não informado'}</dd></div>

            <div><dt>Lançamento</dt><dd>{selected.released || 'Não informado'}</dd></div>

            <div><dt>Avaliação RAWG</dt><dd>{selected.rating ? `${selected.rating.toFixed(2)}/5` : 'Não avaliado'}</dd></div>

            {detail?.developers?.length ? <div><dt>Desenvolvedora</dt><dd>{detail.developers.map((d) => d.name).join(', ')}</dd></div> : null}

          </dl>

          <p className="gv-explore-dialog-note">Ao adicionar, você poderá definir plataforma, status, progresso e favoritos.</p>
          <button
            type="button"
            className="gv-explore-primary"
            disabled={authLoading}
            onClick={() => navigate(isAdmin ? '/adicionar' : '/login', isAdmin ? {
              state: { rawgImport: { id: selected.id, title: selected.name, platforms: selected.platforms.map((p) => p.name) } }
            } : undefined)}
          >
            {isAdmin ? 'Adicionar à Biblioteca' : 'Entrar para adicionar'} <ArrowRight size={17} />
          </button>

          <button type="button" className="gv-explore-primary" onClick={closeDetails}>Voltar ao catálogo</button>

        </section>

      </div>}

    </main>

  )

}



export default Explore
