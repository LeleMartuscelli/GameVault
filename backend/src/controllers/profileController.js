
const pool = require('../config/database')

const profileFields = `
  id,
  display_name AS "displayName",
  username,
  bio,
  avatar_url AS "avatarUrl",
  banner_url AS "bannerUrl",
  featured_game_id AS "featuredGameId",
  favorite_platform AS "favoritePlatform",
  favorite_genre AS "favoriteGenre",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`

// GET - Consultar perfil
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${profileFields}
      FROM profiles
      WHERE id = 1
    `)

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Perfil não encontrado'
      })
    }

    return res.json(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar perfil:', error.message)

    return res.status(500).json({
      message: 'Erro interno ao buscar perfil'
    })
  }
}

// PUT - Atualizar perfil
const updateProfile = async (req, res) => {
  const allowedFields = [
    'displayName',
    'username',
    'bio',
    'featuredGameId',
    'favoritePlatform',
    'favoriteGenre'
  ]

  const body = req.body

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return res.status(400).json({
      message: 'Dados inválidos'
    })
  }

  const keys = Object.keys(body)

  if (
    keys.length === 0 ||
    keys.some((key) => !allowedFields.includes(key))
  ) {
    return res.status(400).json({
      message: 'Informe apenas campos permitidos'
    })
  }

  const textLimits = {
    displayName: 100,
    username: 50,
    bio: 500,
    favoritePlatform: 100,
    favoriteGenre: 100
  }

  const data = {}

  for (const key of keys) {
    const value = body[key]

    if (key === 'featuredGameId') {
      if (
        value !== null &&
        (!Number.isSafeInteger(value) || value <= 0)
      ) {
        return res.status(400).json({
          message: 'Jogo de destaque inválido'
        })
      }

      data[key] = value
      continue
    }

    if (typeof value !== 'string') {
      return res.status(400).json({
        message: `${key} deve ser um texto`
      })
    }

    const trimmed = value.trim()

    if (trimmed.length > textLimits[key]) {
      return res.status(400).json({
        message: `${key} excede o tamanho permitido`
      })
    }

    if (
      ['displayName', 'username'].includes(key) &&
      trimmed.length === 0
    ) {
      return res.status(400).json({
        message: 'Nome e usuário são obrigatórios'
      })
    }

    data[key] = trimmed
  }

  const columnMap = {
    displayName: 'display_name',
    username: 'username',
    bio: 'bio',
    featuredGameId: 'featured_game_id',
    favoritePlatform: 'favorite_platform',
    favoriteGenre: 'favorite_genre'
  }

  const assignments = keys.map(
    (key, index) =>
      `${columnMap[key]} = $${index + 1}`
  )

  const values = keys.map((key) => data[key])

  try {
    const result = await pool.query(`
      UPDATE profiles
      SET
        ${assignments.join(', ')},
        updated_at = NOW()
      WHERE id = 1
      RETURNING ${profileFields}
    `, values)

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Perfil não encontrado'
      })
    }

    return res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({
        message: 'O jogo de destaque não existe'
      })
    }

    console.error('Erro ao atualizar perfil:', error.message)

    return res.status(500).json({
      message: 'Erro interno ao atualizar perfil'
    })
  }
}

module.exports = {
  getProfile,
  updateProfile
}
