
const GAMES_API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000/api/games'

const AUTH_API_URL = GAMES_API_URL.replace(
  /\/games\/?$/,
  '/auth'
)

export interface AuthSession {
  authenticated: boolean
  csrfToken?: string
}

async function parseResponse(
  response: Response
): Promise<AuthSession> {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Erro na autenticação'
    )
  }

  return data as AuthSession
}

export async function login(
  password: string
): Promise<AuthSession> {
  const response = await fetch(
    `${AUTH_API_URL}/login`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    }
  )

  return parseResponse(response)
}

export async function getSession(): Promise<AuthSession> {
  const response = await fetch(
    `${AUTH_API_URL}/me`,
    {
      credentials: 'include'
    }
  )

  return parseResponse(response)
}

export async function logout(
  csrfToken: string
): Promise<AuthSession> {
  const response = await fetch(
    `${AUTH_API_URL}/logout`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-CSRF-Token': csrfToken
      }
    }
  )

  return parseResponse(response)
}
