
import {
  ArrowRight,
  Clock3,
  Gamepad2,
  Heart,
  RotateCw,
  Trophy,
} from 'lucide-react'

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getGameImage } from '../../data/gameImage'
import { getGames, updateGame } from '../../services/gameApi'
import type { Game } from '../../types/games'

import '../Library/Library.css'
import './Favorites.css'

function Favorites() {
  const navigate = useNavigate()

  const [favoriteGames, setFavoriteGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [removingId, setRemovingId] = useState<Game['id'] | null>(
    null
  )

  const [reloadKey, setReloadKey] = useState(0)

  const loadFavoriteGames = useCallback(async () => {
    const games = await getGames()

    return games.filter((game) => game.favorite)
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setLoadError(false)

      try {
        const favorites = await loadFavoriteGames()

        if (!active) return

        setFavoriteGames(favorites)
      } catch (error) {
        console.error(
          'Erro ao carregar favoritos:',
          error
        )

        if (active) {
          setLoadError(true)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [loadFavoriteGames, reloadKey])

  function handleRetry() {
    setReloadKey((current) => current + 1)
  }

  async function handleRemoveFavorite(game: Game) {
    if (removingId !== null) return

    setRemovingId(game.id)

    try {
      await updateGame(game.id, {
        title: game.title,
        platform: game.platform,
        hoursPlayed: game.hoursPlayed,
        timesCompleted: game.timesCompleted,
        achievements: game.achievements,
        status: game.status,
        favorite: false,
      })

      setFavoriteGames((currentGames) =>
        currentGames.filter(
          (currentGame) => currentGame.id !== game.id
        )
      )
    } catch (error) {
      console.error(
        'Erro ao remover favorito:',
        error
      )

      alert(
        'Não foi possível remover o jogo dos favoritos. Tente novamente.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  const totalFavorites = favoriteGames.length

  const totalHours = favoriteGames.reduce(
    (sum, game) => sum + game.hoursPlayed,
    0
  )

  const completedGames = favoriteGames.filter(
    (game) => game.timesCompleted > 0
  ).length

  const statsUnavailable = loading || loadError

  return (
    <main className="gv-library gv-favorites">

      {/* CABEÇALHO */}

      <header className="gv-library-intro">
        <div className="gv-library-intro-copy">

          <span className="gv-library-eyebrow">
            SUA SELEÇÃO ESPECIAL
          </span>

          <h1>
            Jogos que ficam.
            <br />
            <span>Histórias que marcam.</span>
          </h1>

          <p>
            Um espaço para os títulos que fizeram
            parte dos seus melhores momentos.
            Seus favoritos, sempre por perto.
          </p>

        </div>
      </header>

      {/* ESTATÍSTICAS */}

      <section
        className="gv-library-overview"
        aria-label="Resumo dos favoritos"
        aria-busy={loading}
      >

        <div className="gv-library-overview-item">
          <Heart size={21} aria-hidden="true" />

          <div>
            <strong>
              {statsUnavailable ? '—' : totalFavorites}
            </strong>

            <span>Jogos favoritos</span>
          </div>
        </div>

        <div className="gv-library-overview-item">
          <Clock3 size={21} aria-hidden="true" />

          <div>
            <strong>
              {statsUnavailable
                ? '—'
                : `${totalHours.toLocaleString('pt-BR')}h`}
            </strong>

            <span>Horas nos favoritos</span>
          </div>
        </div>

        <div className="gv-library-overview-item">
          <Trophy size={21} aria-hidden="true" />

          <div>
            <strong>
              {statsUnavailable ? '—' : completedGames}
            </strong>

            <span>Jogos concluídos</span>
          </div>
        </div>

      </section>

      {/* COLEÇÃO */}

      <section
        className="gv-library-collection"
        aria-label="Jogos favoritos"
      >

        <div className="gv-library-section-heading">
          <div>

            <span className="gv-library-eyebrow">
              SELEÇÃO PESSOAL
            </span>

            <h2>
              Meus favoritos

              <span className="gv-library-count">
                {statsUnavailable ? '—' : totalFavorites}
              </span>
            </h2>

          </div>
        </div>

        {/* CARREGAMENTO */}

        {loading ? (
          <div
            className="gv-library-empty"
            role="status"
          >
            <Heart size={29} aria-hidden="true" />

            <h3>Carregando seus favoritos...</h3>

            <p>
              Estamos preparando sua seleção
              de jogos.
            </p>
          </div>

        ) : loadError ? (

          /* ERRO DE CONEXÃO */

          <div
            className="gv-library-empty"
            role="alert"
          >
            <Gamepad2 size={29} aria-hidden="true" />

            <h3>
              Não foi possível carregar seus favoritos
            </h3>

            <p>
              Não conseguimos acessar seus jogos
              neste momento. Verifique sua conexão
              e tente novamente.
            </p>

            <button
              type="button"
              className="gv-library-secondary"
              onClick={handleRetry}
            >
              <RotateCw
                size={16}
                aria-hidden="true"
                style={{
                  verticalAlign: 'middle',
                  marginRight: 8,
                }}
              />

              Tentar novamente
            </button>
          </div>

        ) : totalFavorites === 0 ? (

          /* ESTADO VAZIO */

          <div className="gv-library-empty gv-favorites-empty">

            <div className="gv-favorites-empty-symbol">
              <Heart
                size={34}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </div>

            <span className="gv-library-eyebrow">
              SUA LISTA AINDA ESTÁ EM BRANCO
            </span>

            <h3>
              Alguns jogos merecem
              <br />
              um lugar especial.
            </h3>

            <p>
              Encontre seus títulos preferidos na
              Biblioteca e marque o coração para
              reuni-los aqui.
            </p>

            <button
              type="button"
              className="gv-library-primary"
              onClick={() => navigate('/biblioteca')}
            >
              Descobrir minha biblioteca

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </button>

          </div>

        ) : (

          /* LISTA DE FAVORITOS */

          <div className="gv-library-grid">

            {favoriteGames.map((game) => {
              const image = getGameImage(game.title)

              const isRemoving = removingId === game.id

              return (
                <article
                  className="gv-library-card"
                  key={game.id}
                >

                  {/* CAPA */}

                  <div className="gv-library-card-media">

                    {image ? (
                      <img
                        src={image}
                        alt=""
                        loading="lazy"
                      />
                    ) : (
                      <div className="gv-library-card-placeholder">

                        <Gamepad2
                          size={34}
                          aria-hidden="true"
                        />

                        <span>GAMEVAULT</span>

                      </div>
                    )}

                    {/* PLATAFORMA */}

                    <span className="gv-library-platform">
                      {game.platform}
                    </span>

                    {/* REMOVER FAVORITO */}

                    <button
                      type="button"
                      className="gv-library-favorite is-active"
                      aria-label={
                        `Remover ${game.title} dos favoritos`
                      }
                      title="Remover dos favoritos"
                      aria-pressed="true"
                      disabled={removingId !== null}
                      onClick={() =>
                        void handleRemoveFavorite(game)
                      }
                    >
                      <Heart
                        size={19}
                        fill="currentColor"
                        aria-hidden="true"
                      />
                    </button>

                  </div>

                  {/* INFORMAÇÕES */}

                  <div className="gv-library-card-body">

                    <h3>{game.title}</h3>

                    <div className="gv-library-card-metrics">

                      <span>
                        <Clock3
                          size={15}
                          aria-hidden="true"
                        />

                        {game.hoursPlayed.toLocaleString(
                          'pt-BR'
                        )}h jogadas
                      </span>

                      {game.timesCompleted > 0 && (
                        <span>
                          <Trophy
                            size={15}
                            aria-hidden="true"
                          />

                          Zerado {game.timesCompleted}{' '}
                          {game.timesCompleted === 1
                            ? 'vez'
                            : 'vezes'}
                        </span>
                      )}

                    </div>

                    {/* DETALHES */}

                    <button
                      type="button"
                      className="gv-library-details"
                      disabled={isRemoving}
                      onClick={() =>
                        navigate(`/jogo/${game.id}`)
                      }
                    >
                      Ver detalhes

                      <ArrowRight
                        size={17}
                        aria-hidden="true"
                      />
                    </button>

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

export default Favorites
