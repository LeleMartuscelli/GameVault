
import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { ImagePlus, Link2, Trash2, Upload, X } from 'lucide-react'

import {
  addGameMedia,
  getGameMedia,
  removeGameMedia,
  uploadGameMedia
} from '../../services/galleryApi'

import type { GameMedia } from '../../services/galleryApi'

import './GameGallery.css'

type Props = {
  gameId: number
  canManage: boolean
}

type UploadMode = 'file' | 'url'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

function validUrl(value: string): boolean {
  try {
    const url = new URL(value)

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

export default function GameGallery({
  gameId,
  canManage
}: Props) {
  const [items, setItems] = useState<GameMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState<UploadMode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')

  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] =
    useState<number | null>(null)

  const [selected, setSelected] =
    useState<GameMedia | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)

      try {
        const data = await getGameMedia(gameId)

        if (active) {
          setItems(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Erro ao carregar a galeria.'
          )
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
  }, [gameId])

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0] || null

    setError('')

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Use apenas imagens JPG, PNG, WebP ou GIF.')
      setFile(null)
      event.target.value = ''
      return
    }

    if (selectedFile.size === 0 ||
        selectedFile.size > MAX_IMAGE_SIZE) {
      setError('A imagem deve ter mais de 0 bytes e até 5 MB.')
      setFile(null)
      event.target.value = ''
      return
    }

    setFile(selectedFile)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canManage || saving) return

    if (mode === 'file' && !file) {
      setError('Selecione uma imagem.')
      return
    }

    if (mode === 'url' && !validUrl(mediaUrl)) {
      setError('Informe uma URL HTTP ou HTTPS válida.')
      return
    }

    setSaving(true)
    setError('')

    try {
      let created: GameMedia

      if (mode === 'file') {
        created = await uploadGameMedia(
          gameId,
          file!,
          caption.trim()
        )
      } else {
        created = await addGameMedia(gameId, {
          mediaType: 'image',
          mediaUrl: mediaUrl.trim(),
          caption: caption.trim()
        })
      }

      setItems((current) => [created, ...current])
      setFile(null)
      setMediaUrl('')
      setCaption('')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao adicionar imagem.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: GameMedia) {
    if (
      !canManage ||
      removingId !== null ||
      !window.confirm('Excluir esta imagem da galeria?')
    ) {
      return
    }

    setRemovingId(item.id)
    setError('')

    try {
      await removeGameMedia(item.id)

      setItems((current) =>
        current.filter((entry) => entry.id !== item.id)
      )

      if (selected?.id === item.id) {
        setSelected(null)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao excluir imagem.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <section
      className="gv-gallery"
      aria-label="Galeria do jogo"
    >
      <div className="gv-gallery-heading">
        <div>
          <span className="gv-detail-kicker">
            MEMÓRIAS DA SUA JORNADA
          </span>

          <h2>Galeria de momentos.</h2>

          <p>
            Imagens que fazem parte desta história.
          </p>
        </div>

        <span className="gv-gallery-counter">
          {items.length}{' '}
          {items.length === 1 ? 'imagem' : 'imagens'}
        </span>
      </div>

      {error && (
        <p className="gv-gallery-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="gv-gallery-empty">
          Carregando galeria...
        </p>
      ) : items.length === 0 ? (
        <div className="gv-gallery-empty">
          <ImagePlus size={25} />
          <p>Nenhuma imagem registrada ainda.</p>
        </div>
      ) : (
        <div className="gv-gallery-grid">
          {items.map((item) => (
            <article
              className="gv-gallery-card"
              key={item.id}
            >
              <button
                type="button"
                className="gv-gallery-preview"
                onClick={() => setSelected(item)}
                aria-label="Ampliar imagem"
              >
                <img
                  src={item.mediaUrl}
                  alt={item.caption || 'Imagem do jogo'}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </button>

              <div className="gv-gallery-card-footer">
                <span>
                  {item.caption || 'Imagem'}
                </span>

                {canManage && (
                  <button
                    type="button"
                    className="gv-gallery-delete"
                    disabled={removingId !== null}
                    onClick={() => void remove(item)}
                    aria-label="Excluir imagem"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {canManage && (
        <form
          className="gv-gallery-form"
          onSubmit={(event) => void submit(event)}
        >
          <h3>Adicionar à galeria</h3>

          <p>
            Envie uma imagem do computador ou utilize
            um link direto.
          </p>

          <div className="gv-gallery-mode">
            <button
              type="button"
              className={`gv-gallery-mode-button ${
                mode === 'file' ? 'active' : ''
              }`}
              aria-pressed={mode === 'file'}
              onClick={() => setMode('file')}
              disabled={saving}
            >
              <Upload size={16} />
              Enviar arquivo
            </button>

            <button
              type="button"
              className={`gv-gallery-mode-button ${
                mode === 'url' ? 'active' : ''
              }`}
              aria-pressed={mode === 'url'}
              onClick={() => setMode('url')}
              disabled={saving}
            >
              <Link2 size={16} />
              Usar URL
            </button>
          </div>

          <div className="gv-gallery-fields">
            {mode === 'file' ? (
              <label>
                Selecionar imagem
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif"
                  onChange={handleFileChange}
                  disabled={saving}
                />
                <small className="gv-gallery-hint">
                  JPG, PNG, WebP ou GIF. Máximo de 5 MB.
                </small>
              </label>
            ) : (
              <label>
                URL da imagem
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(event) =>
                    setMediaUrl(event.target.value)
                  }
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                  maxLength={2048}
                  disabled={saving}
                />
              </label>
            )}

            <label>
              Legenda (opcional)
              <input
                type="text"
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                maxLength={255}
                placeholder="Um momento especial"
                disabled={saving}
              />
            </label>
          </div>

          <button
            type="submit"
            className="gv-gallery-submit"
            disabled={saving}
          >
            {saving
              ? 'Enviando...'
              : mode === 'file'
                ? 'Enviar para galeria'
                : 'Adicionar imagem'}
          </button>
        </form>
      )}

      {selected && (
        <div
          className="gv-gallery-modal"
          role="presentation"
          onClick={() => setSelected(null)}
        >
          <div
            className="gv-gallery-modal-content"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização da imagem"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="gv-gallery-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            <img
              src={selected.mediaUrl}
              alt={
                selected.caption ||
                'Imagem ampliada do jogo'
              }
              referrerPolicy="no-referrer"
            />

            {selected.caption && (
              <p>{selected.caption}</p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
