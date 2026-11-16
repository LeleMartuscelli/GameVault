
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
    'Content-Type': 'application/json',
    'X-CSRF-Token': session.csrfToken,
  }
}

// Listar mídias de um jogo (público)
export async function getGameMedia(
  gameId: number
): Promise<GameMedia[]> {
  const response = await fetch(
    `${GALLERY_API_URL}/game/${gameId}`
  )

  return handleResponse<GameMedia[]>(
    response,
    'Não foi possível carregar a galeria.'
  )
}

// Adicionar mídia (administradora)
export async function addGameMedia(
  gameId: number,
  data: AddGameMediaData
): Promise<GameMedia> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${GALLERY_API_URL}/game/${gameId}`,
    {
      method: 'POST',
      credentials: 'include',
      headers,
      body: JSON.stringify(data),
    }
  )

  return handleResponse<GameMedia>(
    response,
    'Não foi possível adicionar a mídia.'
  )
}

// Excluir mídia (administradora)
export async function removeGameMedia(
  mediaId: number
): Promise<void> {
  const headers = await getAuthHeaders()

  const response = await fetch(
    `${GALLERY_API_URL}/${mediaId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers,
    }
  )

  await handleResponse<{ message: string }>(
    response,
    'Não foi possível excluir a mídia.'
  )
}
