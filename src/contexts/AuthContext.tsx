
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  login as loginRequest,
  logout as logoutRequest,
  getSession,
} from '../services/authApi'

import { AuthContext } from './authContextValue'

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const session = await getSession()

        if (!active) return

        setIsAdmin(session.authenticated)
        setCsrfToken(
          session.authenticated
            ? session.csrfToken ?? null
            : null
        )
      } catch (error) {
        if (!active) return

        console.error('Erro ao verificar sessão:', error)
        setIsAdmin(false)
        setCsrfToken(null)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [])

  const login = async (password: string) => {
    const session = await loginRequest(password)

    if (!session.authenticated || !session.csrfToken) {
      throw new Error('Não foi possível iniciar a sessão.')
    }

    setIsAdmin(true)
    setCsrfToken(session.csrfToken)
  }

  const logout = async () => {
    if (!csrfToken) {
      throw new Error('Token de segurança indisponível.')
    }

    await logoutRequest(csrfToken)

    setIsAdmin(false)
    setCsrfToken(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        loading,
        csrfToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
