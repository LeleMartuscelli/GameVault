
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/useAuth'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(password)
      navigate('/', { replace: true })
    } catch {
      setError('Não foi possível entrar. Verifique a senha e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <LockKeyhole size={25} />
        </div>

        <span className="login-eyebrow">GAMEVAULT</span>
        <h1>Acesso administrativo</h1>
        <p className="login-description">
          Entre com sua senha para gerenciar sua biblioteca de jogos.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="admin-password">Senha administrativa</label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
            required
            disabled={loading}
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading || !password}>
            {loading ? 'Entrando...' : 'Entrar'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="login-footer">
          Área restrita ao administrador
        </p>
      </div>
    </main>
  )
}
