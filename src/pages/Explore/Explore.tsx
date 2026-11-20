
import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Search,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'

import './Explore.css'

type IgdbGame = {
  id: number
  name: string
  slug: string
  description: string
  released: string | null
  imageUrl: string | null
  rating: number | null
  ratingCount: number
  genres: { id: number; name: string }[]
  platforms: { id: number; name: string }[]
}

type SectionKey = 'popular' | 'recent' | 'upcoming'

type CatalogResponse = {
  success: boolean
  results: IgdbGame[]
  count: number
  hasNext?: boolean
}

type GameDetailResponse = {
  success: boolean
  game: IgdbGame
}

// Compatível com VITE_API_URL terminando em /api/games.
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000'
)

const API_BASE = configuredApiUrl
  .replace(/\/+$/, '')
  .replace(/\/api(?:\/games)?$/, '')

const SECTIONS: {
  key: SectionKey
  label: string
  heading: string
  description: string
}[] = [
  {
    key: 'popular',
    label: 'Em alta',
    heading: 'Jogos em alta',
    description: 'Títulos recentes que despertaram o interesse dos jogadores.',
  },
  {
    key: 'recent',
    label: 'Lançamentos',
    heading: 'Lançamentos recentes',
    description: 'Jogos dos últimos meses, selecionados pela relevância na IGDB.',
  },
  {
    key: 'upcoming',
    label: 'Em breve',
    heading: 'Próximos lançamentos',
    description: 'O que está chegando ao universo dos games.',
  },
]

const GENRES = [
  'Todos',
  'Ação',
  'Aventura',
  'RPG',
  'Indie',
  'Tiro',
  'Estratégia',
]

const PLATFORMS = [
  'Todas',
  'PC',
  'PlayStation',
  'Xbox',
  'Nintendo',
]

const SORTS = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'rating', label: 'Melhor avaliação' },
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigos' },
  { value: 'az', label: 'A–Z' },
]

async function fetchApi<T>(
  path: string,
  signal: AbortSignal
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    credentials: 'include',
  })

  if (!response.ok) {
    let message = 'Não foi possível consultar a IGDB.'

    try {
      const body: {
        message?: string
        error?: string
      } = await response.json()

      message = body.message || body.error || message
    } catch {
      // Mantém a mensagem padrão.
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

function matchesGenre(
  game: IgdbGame,
  chosen: string
): boolean {
  if (chosen === 'Todos') return true

  const names = game.genres
    .map((item) => item.name.toLowerCase())
    .join(' ')

  if (chosen === 'Aventura') {
    return names.includes('adventure')
  }

  if (chosen === 'RPG') {
    return names.includes('role-playing') ||
      names.includes('rpg')
  }

  if (chosen === 'Tiro') {
    return names.includes('shooter')
  }

  if (chosen === 'Estratégia') {
    return names.includes('strategy')
  }

  if (chosen === 'Ação') {
    return /action|shooter|fighting|hack and slash|beat.em up/.test(names)
  }

  return names.includes(chosen.toLowerCase())
}

function matchesPlatform(
  game: IgdbGame,
  chosen: string
): boolean {
  if (chosen === 'Todas') return true

  const names = game.platforms
    .map((item) => item.name.toLowerCase())
    .join(' ')

  if (chosen === 'PC') {
    return names.includes('pc (microsoft windows)') ||
      names.includes('windows')
  }

  if (chosen === 'Nintendo') {
    return names.includes('nintendo') ||
      names.includes('switch')
  }

  return names.includes(chosen.toLowerCase())
}

function Explore() {
  const navigate = useNavigate()

  const { isAdmin, loading: authLoading } = useAuth()

  const catalogRef = useRef<HTMLElement>(null)
  const featuredRef = useRef<HTMLElement>(null)

  const [section, setSection] = useState<SectionKey>('popular')
  const [query, setQuery] = useState('')

  const [genre, setGenre] = useState('Todos')
  const [platform, setPlatform] = useState('Todas')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('relevance')

  const [page, setPage] = useState(1)

  const [games, setGames] = useState<IgdbGame[]>([])
  const [hasNext, setHasNext] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  const [heroIndex, setHeroIndex] = useState(0)

  const [selected, setSelected] = useState<IgdbGame | null>(null)
  const [detail, setDetail] = useState<IgdbGame | null>(null)

  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const searching = query.trim().length > 0

  // CONSULTA AO CATÁLOGO IGDB

  useEffect(() => {
    const controller = new AbortController()

    const timeout = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        setError('')

        try {
          const path = searching
            ? `/api/igdb/search?q=${encodeURIComponent(query.trim())}&page=${page}`
            : `/api/igdb/sections/${section}`

          const data = await fetchApi<CatalogResponse>(
            path,
            controller.signal
          )

          if (controller.signal.aborted) return

          setGames(data.results || [])
          setHasNext(searching && Boolean(data.hasNext))
          setHeroIndex(0)
        } catch (err) {
          if (controller.signal.aborted) return

          setGames([])
          setHasNext(false)

          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar jogos.'
          )
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        }
      })()
    }, searching ? 400 : 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [section, query, page, retry, searching])

  // DETALHES DO JOGO

  useEffect(() => {
    if (!selected) return

    const controller = new AbortController()

    void fetchApi<GameDetailResponse>(
      `/api/igdb/games/${selected.id}`,
      controller.signal
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data.game)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setDetailError(
            err instanceof Error
              ? err.message
              : 'Falha ao carregar detalhes.'
          )
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetailLoading(false)
        }
      })

    return () => controller.abort()
  }, [selected])

  // FECHAR MODAL COM ESCAPE

  useEffect(() => {
    if (!selected) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selected])

  // FILTROS LOCAIS DOS JOGOS CARREGADOS

  const years = useMemo(
    () =>
      [
        ...new Set(
          games
            .map((game) => game.released?.slice(0, 4))
            .filter(
              (value): value is string => Boolean(value)
            )
        ),
      ].sort((a, b) => b.localeCompare(a)),
    [games]
  )

  const visibleGames = useMemo(() => {
    const result = games.filter(
      (game) =>
        matchesGenre(game, genre) &&
        matchesPlatform(game, platform) &&
        (!year || game.released?.startsWith(year))
    )

    if (sort === 'rating') {
      return result.sort(
        (a, b) => (b.rating ?? -1) - (a.rating ?? -1)
      )
    }

    if (sort === 'recent') {
      return result.sort((a, b) =>
        (b.released || '').localeCompare(a.released || '')
      )
    }

    if (sort === 'oldest') {
      return result.sort((a, b) =>
        (a.released || '').localeCompare(b.released || '')
      )
    }

    if (sort === 'az') {
      return result.sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    }

    return result
  }, [games, genre, platform, year, sort])

  const heroGames = games
    .filter((game) => Boolean(game.imageUrl))
    .slice(0, 3)

  const hero = heroGames[
    heroIndex % Math.max(1, heroGames.length)
  ]

  const activeSection =
    SECTIONS.find((item) => item.key === section) ||
    SECTIONS[0]

  const goTo = (
    ref: RefObject<HTMLElement | null>
  ) => {
    ref.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function switchSection(next: SectionKey) {
    setSection(next)
    setQuery('')
    setPage(1)
    setGenre('Todos')
    setPlatform('Todas')
    setYear('')
    setSort('relevance')
  }

  function clearFilters() {
    setGenre('Todos')
    setPlatform('Todas')
    setYear('')
    setSort('relevance')
  }

  function openDetails(game: IgdbGame) {
    setDetail(null)
    setDetailError('')
    setDetailLoading(true)
    setSelected(game)
  }

  function closeDetails() {
    setSelected(null)
    setDetailLoading(false)
  }

  // IMPORTAÇÃO PARA O CADASTRO EXISTENTE

  function importGame() {
    if (!selected) return

    if (!isAdmin) {
      navigate('/login')
      return
    }

    navigate('/adicionar', {
      state: {
        rawgImport: {
          source: 'igdb',
          id: selected.id,
          title: selected.name,
          platforms: selected.platforms.map(
            (item) => item.name
          ),
          imageUrl: selected.imageUrl,
        },
      },
    })
  }

  return (
    <main className="gv-explore">

      {/* BANNER */}

      <section
        className="gv-explore-hero"
        aria-label="Destaque do catálogo"
      >
        {hero?.imageUrl && (
          <img
            key={hero.id}
            src={hero.imageUrl}
            alt=""
            className="gv-explore-hero-art"
          />
        )}

        <div className="gv-explore-hero-wash" />

        <div className="gv-explore-hero-copy">
          <span className="gv-explore-eyebrow">
            EXPLORAR JOGOS
          </span>

          <h1>Descubra novos mundos.</h1>

          <p>
            Conheça lançamentos, descubra novas
            histórias e expanda sua coleção.
          </p>

          <div className="gv-explore-hero-actions">
            <button
              type="button"
              className="gv-explore-primary"
              onClick={() => goTo(catalogRef)}
            >
              Explorar catálogo
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="gv-explore-ghost"
              onClick={() => goTo(featuredRef)}
            >
              Ver jogos
            </button>
          </div>
        </div>

        {hero && (
          <div className="gv-explore-hero-game">
            {hero.name}
          </div>
        )}

        {heroGames.length > 1 && (
          <div className="gv-explore-hero-controls">
            <button
              type="button"
              aria-label="Destaque anterior"
              onClick={() =>
                setHeroIndex(
                  (index) =>
                    (index + heroGames.length - 1) %
                    heroGames.length
                )
              }
            >
              <ChevronLeft size={19} />
            </button>

            <div className="gv-explore-hero-dots">
              {heroGames.map((game, index) => (
                <button
                  type="button"
                  key={game.id}
                  className={
                    index === heroIndex ? 'is-active' : ''
                  }
                  aria-label={`Mostrar destaque ${index + 1}`}
                  aria-pressed={index === heroIndex}
                  onClick={() => setHeroIndex(index)}
                />
              ))}
            </div>

            <button
              type="button"
              aria-label="Próximo destaque"
              onClick={() =>
                setHeroIndex(
                  (index) =>
                    (index + 1) % heroGames.length
                )
              }
            >
              <ChevronRight size={19} />
            </button>
          </div>
        )}
      </section>

      {/* PESQUISA E FILTROS */}

      <section
        className="gv-explore-discovery"
        ref={catalogRef}
        aria-label="Pesquisar jogos"
      >
        <div className="gv-explore-filters">

          <label className="gv-explore-search">
            <Search size={19} />

            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Buscar jogos na IGDB..."
              aria-label="Pesquisar jogos"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setPage(1)
                }}
                aria-label="Limpar pesquisa"
              >
                <X size={16} />
              </button>
            )}
          </label>

          <label className="gv-explore-select">
            <span>Gênero</span>
            <select
              value={genre}
              onChange={(event) =>
                setGenre(event.target.value)
              }
            >
              {GENRES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="gv-explore-select">
            <span>Plataforma</span>
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value)
              }
            >
              {PLATFORMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="gv-explore-select">
            <span>Ano</span>
            <select
              value={year}
              onChange={(event) =>
                setYear(event.target.value)
              }
            >
              <option value="">Todos</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="gv-explore-select">
            <span>Ordenar</span>
            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
            >
              {SORTS.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* CATEGORIAS PRINCIPAIS */}

        <div
          className="gv-explore-genres"
          aria-label="Seções do catálogo"
        >
          {SECTIONS.map((item) => (
            <button
              type="button"
              key={item.key}
              className={
                !searching && section === item.key
                  ? 'is-selected'
                  : ''
              }
              aria-pressed={
                !searching && section === item.key
              }
              onClick={() => switchSection(item.key)}
            >
              {item.key === 'popular' && (
                <Gamepad2 size={16} />
              )}
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}

      <section
        className="gv-explore-section"
        ref={featuredRef}
      >
        <div className="gv-explore-section-heading">
          <div>
            <span className="gv-explore-eyebrow">
              CATÁLOGO IGDB
            </span>

            <h2>
              {searching
                ? 'Resultados da pesquisa'
                : activeSection.heading}
            </h2>

            <p>
              {searching
                ? `Busca por “${query.trim()}”`
                : activeSection.description}
            </p>
          </div>

          <span className="gv-explore-count">
            {loading
              ? 'Buscando...'
              : `${visibleGames.length} de ${games.length} exibidos`}
          </span>
        </div>

        {error && (
          <div
            className="gv-explore-empty"
            role="alert"
          >
            {error}
            <button
              type="button"
              onClick={() =>
                setRetry((value) => value + 1)
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!error && loading && (
          <div
            className="gv-explore-loading"
            role="status"
          >
            Carregando jogos da IGDB...
          </div>
        )}

        {!error && !loading && (
          visibleGames.length ? (
            <>
              <div className="gv-explore-grid">
                {visibleGames.map((game) => (
                  <button
                    type="button"
                    className="gv-explore-card"
                    key={game.id}
                    onClick={() => openDetails(game)}
                    aria-label={`Ver detalhes de ${game.name}`}
                  >
                    <div className="gv-explore-cover">
                      {game.imageUrl ? (
                        <img
                          src={game.imageUrl}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <div className="gv-explore-cover-fallback">
                          <Gamepad2 size={28} />
                          <span>SEM CAPA</span>
                        </div>
                      )}

                      <span className="gv-explore-card-action">
                        Ver detalhes
                        <ArrowRight size={15} />
                      </span>
                    </div>

                    <div className="gv-explore-card-meta">
                      <strong>{game.name}</strong>

                      <span>
                        {game.genres
                          .slice(0, 2)
                          .map((item) => item.name)
                          .join(' · ') || 'Jogo'}

                        {game.released
                          ? ` · ${game.released.slice(0, 4)}`
                          : ''}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {searching && (
                <nav
                  className="gv-explore-pagination"
                  aria-label="Páginas da pesquisa"
                >
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => {
                      setPage((value) =>
                        Math.max(1, value - 1)
                      )
                      goTo(featuredRef)
                    }}
                  >
                    Anterior
                  </button>

                  <span>Página {page}</span>

                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={() => {
                      setPage((value) => value + 1)
                      goTo(featuredRef)
                    }}
                  >
                    Próxima
                    <ArrowRight size={15} />
                  </button>
                </nav>
              )}
            </>
          ) : (
            <div className="gv-explore-empty">
              {games.length
                ? 'Nenhum dos jogos carregados corresponde aos filtros.'
                : 'Nenhum jogo encontrado.'}

              <button
                type="button"
                onClick={() => {
                  clearFilters()
                  setQuery('')
                  setPage(1)
                }}
              >
                Limpar filtros
              </button>
            </div>
          )
        )}

        {!loading && !error && (
          <p className="gv-explore-demo-notice">
            Gênero, plataforma, ano e ordenação
            filtram apenas os jogos carregados
            nesta seção ou página.
          </p>
        )}
      </section>

      {/* DESTAQUE EDITORIAL */}

      <section
        className="gv-explore-editorial"
        aria-label="Destaque editorial"
      >
        <span className="gv-explore-eyebrow">
          DESCUBRA MAIS
        </span>

        <h2>
          Mais do que jogar.
          <br />
          Descobrir novas histórias.
        </h2>

        <p>
          Explore títulos fora da sua coleção
          e encontre sua próxima grande aventura.
        </p>

        <button
          type="button"
          onClick={() => goTo(catalogRef)}
        >
          Conhecer o catálogo
          <ArrowRight size={17} />
        </button>
      </section>

      <p className="gv-explore-demo-notice">
        Dados e imagens fornecidos por{' '}
        <a
          href="https://www.igdb.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          IGDB
        </a>.
      </p>

      {/* DETALHES DO JOGO */}

      {selected && (
        <div
          className="gv-explore-overlay"
          onClick={closeDetails}
        >
          <section
            className="gv-explore-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gv-explore-dialog-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="gv-explore-dialog-close"
              onClick={closeDetails}
              aria-label="Fechar detalhes"
            >
              <X size={21} />
            </button>

            {selected.imageUrl && (
              <img
                className="gv-explore-detail-art"
                src={selected.imageUrl}
                alt=""
              />
            )}

            <span className="gv-explore-eyebrow">
              SOBRE O JOGO
            </span>

            <h2 id="gv-explore-dialog-title">
              {selected.name}
            </h2>

            {detailLoading && (
              <p role="status">
                Carregando detalhes...
              </p>
            )}

            {detailError && (
              <p role="alert">{detailError}</p>
            )}

            {(detail?.description ||
              selected.description) && (
              <p>
                {detail?.description ||
                  selected.description}
              </p>
            )}

            <dl>
              <div>
                <dt>Gêneros</dt>
                <dd>
                  {selected.genres
                    .map((item) => item.name)
                    .join(', ') || 'Não informado'}
                </dd>
              </div>

              <div>
                <dt>Plataformas</dt>
                <dd>
                  {selected.platforms
                    .map((item) => item.name)
                    .join(', ') || 'Não informado'}
                </dd>
              </div>

              <div>
                <dt>Lançamento</dt>
                <dd>
                  {selected.released || 'Não informado'}
                </dd>
              </div>

              <div>
                <dt>Avaliação IGDB</dt>
                <dd>
                  {selected.rating == null
                    ? 'Não avaliado'
                    : `${selected.rating.toFixed(0)}/100`}
                </dd>
              </div>
            </dl>

            <p className="gv-explore-dialog-note">
              Ao adicionar, você poderá definir
              plataforma, progresso, favoritos
              e destaque no Início.
            </p>

            <button
              type="button"
              className="gv-explore-primary"
              onClick={importGame}
              disabled={authLoading}
            >
              {isAdmin
                ? 'Adicionar à Biblioteca'
                : 'Entrar para adicionar'}
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="gv-explore-primary"
              onClick={closeDetails}
            >
              Voltar ao catálogo
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default Explore
