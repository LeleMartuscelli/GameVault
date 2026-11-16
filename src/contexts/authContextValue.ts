
import { createContext } from 'react'

export interface AuthContextType {
  isAdmin: boolean
  loading: boolean
  csrfToken: string | null
  login: (password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)
