
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Gamepad2,
  Heart,
  Monitor,
  Pencil,
  RotateCw,
  UserRound,
  X,
} from 'lucide-react'

import { getGames } from '../../services/gameApi'
import {
  getProfile,
  updateProfile,
} from '../../services/profileApi'
import type {
  Profile as ProfileData,
  UpdateProfileData,
} from '../../services/profileApi'
import { getGameImage } from '../../data/gameImage'
import type { Game } from '../../types/games'

import '../Library/Library.css'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [success, setSuccess] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [form, setForm] = useState<UpdateProfileData>({
    displayName: '',
    username: '',
    bio: '',
    featuredGameId: null,
    favoritePlatform: '',
    favoriteGenre: '',
  })

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [profileData, gamesData] = await Promise.all([
          getProfile(),
          getGames(),
        ])

        if (!active) return

        setProfile(profileData)
        setGames(gamesData)
      } catch (err) {
        if (!active) return

        setError(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar o perfil.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [reloadKey])

  function openEditor() {
    if (!profile) return

    setForm({
      displayName: profile.displayName,
      username: profile.username,
      bio: profile.bio,
      featuredGameId: profile.featuredGameId,
      favoritePlatform: profile.favoritePlatform ?? '',
      favoriteGenre: profile.favoriteGenre ?? '',
    })

    setSaveError('')
    setSuccess('')
    setEditing(true)
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setSaving(true)
    setSaveError('')

    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      setEditing(false)
      setSuccess('Perfil atualizado com sucesso.')
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar o perfil.'
      )
    } finally {
      setSaving(false)
    }
  }

  const favorites = games.filter((game) => game.favorite)
  const featuredGame = games.find(
    (game) => game.id === profile?.featuredGameId
  )

  const platforms = Array.from(
    new Set(games.map((game) => game.platform))
  ).sort()

  if (loading) {
    return (
      <main className="gv-library gv-profile">
        <div className="gv-library-empty" role="status">
          <UserRound size={28} />
          <h3>Carregando seu perfil...</h3>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="gv-library gv-profile">
        <div className="gv-library-empty" role="alert">
          <h3>Não foi possível carregar o perfil.</h3>
          <p>{error || 'Perfil não encontrado.'}</p>
          <button
            type="button"
            className="gv-library-secondary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            <RotateCw size={16} /> Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="gv-library gv-profile">
      <span className="gv-profile-eyebrow">
        SEU ESPAÇO NO GAMEVAULT
      </span>

      <section className="gv-profile-cover">
        <span className="gv-profile-cover-watermark">
          GAMEVAULT
        </span>
      </section>

      <section className="gv-profile-identity">
        <div className="gv-profile-avatar">
          <UserRound size={36} strokeWidth={1.5} />
        </div>

        <div className="gv-profile-identity-copy">
          <h1>{profile.displayName}</h1>
          <span className="gv-profile-handle">
            @{profile.username}
          </span>
          <p>{profile.bio || 'Sua história gamer começa aqui.'}</p>
        </div>

        <button
          type="button"
          className="gv-profile-edit-button"
          onClick={openEditor}
        >
          <Pencil size={17} />
          Editar perfil
        </button>
      </section>

      {success && (
        <p className="gv-profile-success" role="status">
          {success}
        </p>
      )}

      <section className="gv-profile-section">
        <div className="gv-profile-heading">
          <div>
            <span className="gv-library-eyebrow">SOBRE MIM</span>
            <h2>Minha identidade gamer.</h2>
          </div>
        </div>

        <div className="gv-profile-preferences">
          <div className="gv-profile-preference">
            <Heart size={21} />
            <div>
              <span>Jogo de destaque</span>
              <strong>{featuredGame?.title ?? 'A definir'}</strong>
            </div>
          </div>

          <div className="gv-profile-preference">
            <Monitor size={21} />
            <div>
              <span>Plataforma principal</span>
              <strong>
                {profile.favoritePlatform || 'A definir'}
              </strong>
            </div>
          </div>

          <div className="gv-profile-preference">
            <Gamepad2 size={21} />
            <div>
              <span>Gênero favorito</span>
              <strong>{profile.favoriteGenre || 'A definir'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="gv-profile-section">
        <div className="gv-profile-heading">
          <div>
            <span className="gv-library-eyebrow">
              MINHA SELEÇÃO
            </span>
            <h2>
              Meus favoritos
              <span className="gv-library-count">
                {favorites.length}
              </span>
            </h2>
          </div>

          <button
            type="button"
            className="gv-profile-link"
            onClick={() => navigate('/biblioteca')}
          >
            Ver biblioteca <ArrowRight size={17} />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="gv-library-empty">
            <Heart size={29} />
            <h3>Sua seleção começa aqui.</h3>
            <p>Marque seus jogos favoritos na Biblioteca.</p>
          </div>
        ) : (
          <div className="gv-library-grid">
            {favorites.map((game) => {
              const image = getGameImage(game.title)

              return (
                <article className="gv-library-card" key={game.id}>
                  <div className="gv-library-card-media">
                    {image ? (
                      <img src={image} alt="" loading="lazy" />
                    ) : (
                      <div className="gv-library-card-placeholder">
                        <Gamepad2 size={34} />
                        <span>GAMEVAULT</span>
                      </div>
                    )}

                    <span className="gv-library-platform">
                      {game.platform}
                    </span>

                    <span className="gv-profile-favorite-icon">
                      <Heart size={18} fill="currentColor" />
                    </span>
                  </div>

                  <div className="gv-library-card-body">
                    <h3>{game.title}</h3>
                    <p className="gv-profile-game-hours">
                      {game.hoursPlayed.toLocaleString('pt-BR')}h jogadas
                    </p>
                    <button
                      type="button"
                      className="gv-library-details"
                      onClick={() => navigate(`/jogo/${game.id}`)}
                    >
                      Ver detalhes <ArrowRight size={17} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {editing && (
        <div className="gv-profile-modal-overlay">
          <section
            className="gv-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gv-edit-profile-title"
          >
            <div className="gv-profile-modal-heading">
              <div>
                <span className="gv-library-eyebrow">
                  PERSONALIZAÇÃO
                </span>
                <h2 id="gv-edit-profile-title">Editar perfil</h2>
              </div>
              <button
                type="button"
                className="gv-profile-close"
                aria-label="Fechar"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={(event) => void saveProfile(event)}>
              <label>
                Nome de exibição
                <input
                  value={form.displayName ?? ''}
                  maxLength={100}
                  required
                  onChange={(e) =>
                    setForm({ ...form, displayName: e.target.value })
                  }
                />
              </label>

              <label>
                Nome de usuário
                <input
                  value={form.username ?? ''}
                  maxLength={50}
                  required
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                />
              </label>

              <label>
                Biografia
                <textarea
                  value={form.bio ?? ''}
                  maxLength={500}
                  rows={3}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                />
              </label>

              <label>
                Jogo de destaque
                <select
                  value={form.featuredGameId ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      featuredGameId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                >
                  <option value="">Nenhum</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Plataforma principal
                <select
                  value={form.favoritePlatform ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      favoritePlatform: e.target.value,
                    })
                  }
                >
                  <option value="">A definir</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Gênero favorito
                <input
                  value={form.favoriteGenre ?? ''}
                  maxLength={100}
                  placeholder="Ex.: FPS, ação, aventura"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      favoriteGenre: e.target.value,
                    })
                  }
                />
              </label>

              {saveError && (
                <p className="gv-profile-form-error" role="alert">
                  {saveError}
                </p>
              )}

              <div className="gv-profile-modal-actions">
                <button
                  type="button"
                  className="gv-profile-cancel"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="gv-profile-save"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default Profile
