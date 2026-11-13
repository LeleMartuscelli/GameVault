
const argon2 = require('argon2')
const crypto = require('node:crypto')

const login = async (req, res) => {
  const { password } = req.body || {}

  if (typeof password !== 'string' || !password) {
    return res.status(400).json({
      message: 'Informe a senha.'
    })
  }

  if (!process.env.ADMIN_PASSWORD_HASH) {
    return res.status(500).json({
      message: 'Autenticação não configurada.'
    })
  }

  try {
    const validPassword = await argon2.verify(
      process.env.ADMIN_PASSWORD_HASH,
      password
    )

    if (!validPassword) {
      return res.status(401).json({
        message: 'Credenciais inválidas.'
      })
    }

    // Cria uma nova sessão para evitar reutilização
    req.session.regenerate((error) => {
      if (error) {
        console.error('Erro ao criar sessão:', error)
        return res.status(500).json({
          message: 'Erro ao iniciar sessão.'
        })
      }

      req.session.isAdmin = true
      req.session.csrfToken = crypto.randomBytes(32).toString('hex')

      req.session.save((saveError) => {
        if (saveError) {
          console.error('Erro ao salvar sessão:', saveError)
          return res.status(500).json({
            message: 'Erro ao salvar sessão.'
          })
        }

        return res.json({
          authenticated: true,
          csrfToken: req.session.csrfToken
        })
      })
    })
  } catch (error) {
    console.error('Erro na autenticação:', error.message)

    return res.status(500).json({
      message: 'Erro interno na autenticação.'
    })
  }
}

const me = (req, res) => {
  if (req.session?.isAdmin !== true) {
    return res.json({
      authenticated: false
    })
  }

  return res.json({
    authenticated: true,
    csrfToken: req.session.csrfToken
  })
}

const logout = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Erro ao encerrar sessão:', error.message)
      return res.status(500).json({
        message: 'Erro ao encerrar sessão.'
      })
    }

    res.clearCookie('gamevault.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax'
    })

    return res.json({
      authenticated: false,
      message: 'Sessão encerrada.'
    })
  })
}

module.exports = {
  login,
  me,
  logout
}
