import type { Game, GameStatus } from '../types/games'

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

export async function getGames(): Promise<Game[]> {
  const response = await fetch(API_URL)

  if (!response.ok) {
    throw new Error('Erro ao buscar jogos')
  }

  return response.json()
}

export async function getGameById(
  id: number
): Promise<Game> {
  const response = await fetch(`${API_URL}/${id}`)

  if (!response.ok) {
    throw new Error('Jogo não encontrado')
  }

  return response.json()
}

export async function createGame(
  game: CreateGameData
): Promise<Game> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(game),
  })

  if (!response.ok) {
    throw new Error('Erro ao cadastrar jogo')
  }

  return response.json()
}

export async function deleteGame(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Erro ao excluir jogo')
  }
}

export async function updateGame(
  id: number,
  game: CreateGameData
): Promise<Game> {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(game),
  })

  if (!response.ok) {
    throw new Error('Erro ao atualizar jogo')
  }

  return response.json()
}