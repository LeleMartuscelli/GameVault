
import { useContext } from 'react'
import { AuthContext } from './authContextValue'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth deve ser utilizado dentro de AuthProvider'
    )
  }

  return context
}
