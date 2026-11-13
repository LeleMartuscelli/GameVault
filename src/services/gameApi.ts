
import type { Game, GameStatus } from '../types/games'
import { getSession } from './authApi'

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api/games'

export interface CreateGameData {
  title: string
  platform: string
  hoursPlayed: number
  timesCompleted: number
  achievements: number
  status: GameStatus
  favorite: boolean
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const session = await getSession()

  if (!session.authenticated || !session.csrfToken) {
    throw new Error(
      'Você precisa estar autenticada para alterar a biblioteca.'
    )
  }

  return {
    'Content-Type': 'application/json',
    'X-CSRF-Token': session.csrfToken,
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

// GET — Listar jogos (público)
export async function getGames(): Promise<Game[]> {
  const response = await fetch(API_URL)

  return handleResponse<Game[]>(
    response,
    'Erro ao buscar jogos'
  )
}

// GET — Buscar jogo por ID (público)
export async function getGameById(
  id: number
): Promise<Game> {
  const response = await fetch(`${API_URL}/${id}`)

  return handleResponse<Game>(
    response,
    'Jogo não encontrado'
  )
}

// POST — Cadastrar jogo (administradora)
export async function createGame(
  game: CreateGameData
): Promise<Game> {
  const headers = await getAuthHeaders()

  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: JSON.stringify(game),
  })

  return handleResponse<Game>(
    response,
    'Erro ao cadastrar jogo'
  )
}

// DELETE — Excluir jogo (administradora)
export async function deleteGame(
  id: number
): Promise<void> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers,
  })

  if (!response.ok) {
    await handleResponse<unknown>(
      response,
      'Erro ao excluir jogo'
    )
  }
}

// PUT — Atualizar jogo (administradora)
export async function updateGame(
  id: number,
  game: CreateGameData
): Promise<Game> {
  const headers = await getAuthHeaders()

  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers,
    body: JSON.stringify(game),
  })

  return handleResponse<Game>(
    response,
    'Erro ao atualizar jogo'
  )
}
