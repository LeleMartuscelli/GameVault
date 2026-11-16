
import { getSession } from './authApi'

const GAMES_API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api/games'

const GALLERY_API_URL = GAMES_API_URL.replace(
  /\/games\/?$/,
  '/gallery'
)

export interface GameMedia {
  id: number
  gameId: number
  mediaType: 'image' | 'video'
  mediaUrl: string
  caption: string | null
  createdAt: string
}

export interface AddGameMediaData {
  mediaType: 'image' | 'video'
  mediaUrl: string
  caption?: string
}

function resolveMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  const apiOrigin = new URL(GALLERY_API_URL).origin

  return new URL(url, apiOrigin).href
}

function normalizeMedia(media: GameMedia): GameMedia {
  return {
    ...media,
    mediaUrl: resolveMediaUrl(media.mediaUrl)
  }
}

async function handleResponse<T>(
  response: Response,
  defaultMessage: string
): Promise<T> {
  if (!response.ok) {
    let message = defaultMessage

    try {
      const data = await response.json()
      message = data.message || defaultMessage
    } catch {
      // Mantém a mensagem padrão
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession()

  if (!session.authenticated || !session.csrfToken) {
    throw new Error(
      'Você precisa estar autenticada para gerenciar a galeria.'
    )
  }

  return {
    'X-CSRF-Token': session.csrfToken
  }
}

// Consulta pública
export async function getGameMedia(
  gameId: number
): Promise<GameMedia[]> {
  const response = await fetch(
    `${GALLERY_API_URL}/game/${gameId}`
  )

  const data = await handleResponse<GameMedia[]>(
    response,
    'Não foi possível carregar a galeria.'
  )

  return data.map(normalizeMedia)
}

// Cadastro por URL
export async function addGameMedia(
  gameId: number,
  data: AddGameMediaData
): Promise<GameMedia> {
  const authHeaders = await getAuthHeaders()

  const response = await fetch(
    `${GALLERY_API_URL}/game/${gameId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  )

  const media = await handleResponse<GameMedia>(
    response,
    'Não foi possível adicionar a mídia.'
  )

  return normalizeMedia(media)
}

// Upload direto do computador
export async function uploadGameMedia(
  gameId: number,
  file: File,
  caption = ''
): Promise<GameMedia> {
  const headers = await getAuthHeaders()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('caption', caption)

  const response = await fetch(
    `${GALLERY_API_URL}/game/${gameId}/upload`,
    {
      method: 'POST',
      credentials: 'include',
      headers,
      body: formData
    }
  )

  const media = await handleResponse<GameMedia>(
    response,
    'Não foi possível enviar o arquivo.'
  )

  return normalizeMedia(media)
}

// Exclusão administrativa
export async function removeGameMedia(
  mediaId: number
): Promise<void> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${GALLERY_API_URL}/${mediaId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers
    }
  )

  await handleResponse<{ message: string }>(
    response,
    'Não foi possível excluir a mídia.'
  )
}
