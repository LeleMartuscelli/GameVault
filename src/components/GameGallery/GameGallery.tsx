import { useEffect, useState } from 'react'
import { ImagePlus, Trash2, X } from 'lucide-react'
import { addGameMedia, getGameMedia, removeGameMedia } from '../../services/galleryApi'
import type { GameMedia } from '../../services/galleryApi'
import './GameGallery.css'

type Props = { gameId: number; canManage: boolean }

function validUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') &&
      Boolean(url.hostname) && !url.username && !url.password
  } catch {
    return false
  }
}

export default function GameGallery({ gameId, canManage }: Props) {
  const [items, setItems] = useState<GameMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [selected, setSelected] = useState<GameMedia | null>(null)

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const data = await getGameMedia(gameId)
        if (active) { setItems(data); setError('') }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar galeria.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [gameId])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage || saving) return
    if (!validUrl(mediaUrl)) { setError('Informe um link HTTP ou HTTPS válido.'); return }
    setSaving(true)
    setError('')
    try {
      const created = await addGameMedia(gameId, { mediaType, mediaUrl: mediaUrl.trim(), caption: caption.trim() })
      setItems((current) => [created, ...current])
      setMediaUrl('')
      setCaption('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar mídia.')
    } finally { setSaving(false) }
  }

  async function remove(item: GameMedia) {
    if (!canManage || removingId !== null || !window.confirm('Excluir esta mídia da galeria?')) return
    setRemovingId(item.id)
    setError('')
    try {
      await removeGameMedia(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      if (selected?.id === item.id) setSelected(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir mídia.')
    } finally { setRemovingId(null) }
  }

  return (
    <section className="gv-gallery" aria-label="Galeria do jogo">
      <div className="gv-gallery-heading">
        <div>
          <span className="gv-detail-kicker">MEMÓRIAS DA SUA JORNADA</span>
          <h2>Galeria de momentos.</h2>
          <p>Imagens e vídeos que fazem parte desta história.</p>
        </div>
        <span className="gv-gallery-counter">{items.length} {items.length === 1 ? 'registro' : 'registros'}</span>
      </div>

      {error && <p className="gv-gallery-error" role="alert">{error}</p>}
      {loading ? <p className="gv-gallery-empty">Carregando galeria...</p> : (
        items.length === 0 ? <div className="gv-gallery-empty"><ImagePlus size={25} /><p>Nenhum momento registrado ainda.</p></div> : (
          <div className="gv-gallery-grid">
            {items.map((item) => (
              <article className="gv-gallery-card" key={item.id}>
                <button type="button" className="gv-gallery-preview" onClick={() => setSelected(item)} aria-label={`Abrir ${item.mediaType === 'image' ? 'imagem' : 'vídeo'}${item.caption ? `: ${item.caption}` : ''}`}>
                  {item.mediaType === 'image' ? <img src={item.mediaUrl} alt={item.caption || 'Imagem do jogo'} loading="lazy" referrerPolicy="no-referrer" /> : <span className="gv-gallery-video-placeholder">▶<small>Ver vídeo</small></span>}
                </button>
                <div className="gv-gallery-card-footer">
                  <span>{item.caption || (item.mediaType === 'image' ? 'Imagem' : 'Vídeo')}</span>
                  {canManage && <button type="button" className="gv-gallery-delete" disabled={removingId !== null} onClick={() => void remove(item)} aria-label="Excluir mídia"><Trash2 size={17} /></button>}
                </div>
              </article>
            ))}
          </div>
        )
      )}

      {canManage && (
        <form className="gv-gallery-form" onSubmit={(event) => void submit(event)}>
          <h3>Adicionar à galeria</h3>
          <p>Cole um link direto de imagem ou vídeo (MP4/WebM). Links comuns de páginas do YouTube não são suportados nesta versão.</p>
          <div className="gv-gallery-fields">
            <label>Tipo<select value={mediaType} onChange={(event) => setMediaType(event.target.value as 'image' | 'video')}><option value="image">Imagem</option><option value="video">Vídeo</option></select></label>
            <label>URL da mídia<input type="url" value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="https://exemplo.com/imagem.jpg" required maxLength={2048} /></label>
            <label>Legenda (opcional)<input type="text" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={255} placeholder="Um momento especial" /></label>
          </div>
          <button type="submit" className="gv-gallery-submit" disabled={saving}>{saving ? 'Adicionando...' : 'Adicionar mídia'}</button>
        </form>
      )}

      {selected && (
        <div className="gv-gallery-modal" role="presentation" onClick={() => setSelected(null)}>
          <div className="gv-gallery-modal-content" role="dialog" aria-modal="true" aria-label="Visualização da mídia" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gv-gallery-modal-close" onClick={() => setSelected(null)} aria-label="Fechar"><X size={22} /></button>
            {selected.mediaType === 'image' ? <img src={selected.mediaUrl} alt={selected.caption || 'Imagem ampliada do jogo'} referrerPolicy="no-referrer" /> : <video src={selected.mediaUrl} controls playsInline preload="metadata" />}
            {selected.caption && <p>{selected.caption}</p>}
          </div>
        </div>
      )}
    </section>
  )
}
