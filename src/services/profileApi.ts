
import { getSession } from './authApi'

// Usa a mesma origem configurada para a API de jogos
const GAMES_API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api/games'

const PROFILE_API_URL = new URL(
  'profile',
  `${GAMES_API_URL.replace(/\/games\/?$/, '/')}`
).toString()

export interface Profile {
  id: number
  displayName: string
  username: string
  bio: string
  avatarUrl: string | null
  bannerUrl: string | null
  featuredGameId: number | null
  favoritePlatform: string | null
  favoriteGenre: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileData {
  displayName?: string
  username?: string
  bio?: string
  featuredGameId?: number | null
  favoritePlatform?: string
  favoriteGenre?: string
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = 'Erro ao acessar o perfil'

    try {
      const data = await response.json()
      message = data.message || message
    } catch {
      // Mantém a mensagem padrão
    }

    throw new Error(message)
  }

  return response.json() as Promise<T>
}

// GET — Consultar perfil autenticado
export async function getProfile(): Promise<Profile> {
  const response = await fetch(PROFILE_API_URL, {
    credentials: 'include',
  })

  return handleResponse<Profile>(response)
}

// PUT — Atualizar perfil autenticado
export async function updateProfile(
  data: UpdateProfileData
): Promise<Profile> {
  const session = await getSession()

  if (!session.authenticated || !session.csrfToken) {
    throw new Error(
      'Você precisa estar autenticada para editar seu perfil.'
    )
  }

  const response = await fetch(PROFILE_API_URL, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': session.csrfToken,
    },
    body: JSON.stringify(data),
  })

  return handleResponse<Profile>(response)
}
