
const pool = require('../config/database')

const validStatuses = [
  'Jogando',
  'Zerado',
  'Quero jogar',
  'Pausado',
  'Abandonado'
]

const gameFields = `
  id,
  title,
  platform,
  hours_played AS "hoursPlayed",
  times_completed AS "timesCompleted",
  achievements,
  status,
  favorite,
  rawg_id AS "rawgId",
  image_url AS "imageUrl",
  show_on_home AS "showOnHome",
  is_hero AS "isHero"
`

function validateGame(data, isUpdate = false) {
  const {
    title,
    platform,
    hoursPlayed,
    timesCompleted,
    achievements,
    status,
    favorite,
    rawgId,
    imageUrl,
    showOnHome,
    isHero
  } = data

  if (!isUpdate) {
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof platform !== 'string' ||
      !platform.trim() ||
      !status
    ) {
      return 'Título, plataforma e status são obrigatórios'
    }
  }

  if (
    title !== undefined &&
    (typeof title !== 'string' || !title.trim())
  ) {
    return 'Título inválido'
  }

  if (
    platform !== undefined &&
    (typeof platform !== 'string' || !platform.trim())
  ) {
    return 'Plataforma inválida'
  }

  if (status !== undefined && !validStatuses.includes(status)) {
    return 'Status inválido'
  }

  const numbers = [
    hoursPlayed,
    timesCompleted,
    achievements
  ]

  if (numbers.some(
    (value) =>
      value !== undefined &&
      (!Number.isSafeInteger(value) || value < 0)
  )) {
    return 'Os valores numéricos devem ser inteiros não negativos'
  }

  if (
    favorite !== undefined &&
    typeof favorite !== 'boolean'
  ) {
    return 'Favorito deve ser verdadeiro ou falso'
  }

  if (
    showOnHome !== undefined &&
    typeof showOnHome !== 'boolean'
  ) {
    return 'showOnHome deve ser verdadeiro ou falso'
  }

  if (
    isHero !== undefined &&
    typeof isHero !== 'boolean'
  ) {
    return 'isHero deve ser verdadeiro ou falso'
  }

  if (
    rawgId !== undefined &&
    rawgId !== null &&
    (!Number.isSafeInteger(rawgId) || rawgId <= 0)
  ) {
    return 'ID da RAWG inválido'
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string') {
      return 'URL da imagem inválida'
    }

    if (imageUrl.length > 2048) {
      return 'URL da imagem muito longa'
    }

    try {
      const parsed = new URL(imageUrl)
      if (parsed.protocol !== 'https:') {
        return 'A imagem deve utilizar HTTPS'
      }
    } catch {
      return 'URL da imagem inválida'
    }
  }

  if (isHero === true && showOnHome === false) {
    return 'O jogo do banner precisa aparecer no Início'
  }

  return null
}

// GET - Listar todos os jogos
const getGames = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${gameFields}
      FROM games
      ORDER BY id
    `)

    res.json(result.rows)
  } catch (error) {
    console.error('Erro ao listar jogos:', error.message)

    res.status(500).json({
      message: 'Erro interno ao buscar jogos'
    })
  }
}

// GET - Buscar jogo por ID
const getGameById = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'ID inválido'
    })
  }

  try {
    const result = await pool.query(`
      SELECT ${gameFields}
      FROM games
      WHERE id = $1
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Erro ao buscar jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao buscar jogo'
    })
  }
}

// POST - Cadastrar novo jogo
const createGame = async (req, res) => {
  const data = req.body

  const validationError = validateGame(data)

  if (validationError) {
    return res.status(400).json({
      message: validationError
    })
  }

  const {
    title,
    platform,
    hoursPlayed = 0,
    timesCompleted = 0,
    achievements = 0,
    status,
    favorite = false,
    rawgId = null,
    imageUrl = null,
    showOnHome = true,
    isHero = false
  } = data

  const client = await pool.connect().catch((error) => {
    console.error('Erro de conexão:', error.message)
    return null
  })

  if (!client) {
    return res.status(500).json({
      message: 'Erro ao conectar ao banco de dados'
    })
  }

  try {
    await client.query('BEGIN')

    // Evita importar o mesmo jogo da RAWG
    // duas vezes para a mesma plataforma.
    if (rawgId !== null) {
      const existing = await client.query(`
        SELECT id
        FROM games
        WHERE rawg_id = $1
          AND LOWER(platform) = LOWER($2)
        LIMIT 1
      `, [rawgId, platform.trim()])

      if (existing.rows.length > 0) {
        await client.query('ROLLBACK')

        return res.status(409).json({
          message: 'Este jogo já está cadastrado nessa plataforma'
        })
      }
    }

    // Se escolhido como banner, desmarca o anterior.
    if (isHero) {
      await client.query(`
        UPDATE games
        SET is_hero = FALSE
        WHERE is_hero = TRUE
      `)
    }

    const result = await client.query(`
      INSERT INTO games (
        title,
        platform,
        hours_played,
        times_completed,
        achievements,
        status,
        favorite,
        rawg_id,
        image_url,
        show_on_home,
        is_hero
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11
      )
      RETURNING ${gameFields}
    `, [
      title.trim(),
      platform.trim(),
      hoursPlayed,
      timesCompleted,
      achievements,
      status,
      favorite,
      rawgId,
      imageUrl,
      isHero ? true : showOnHome,
      isHero
    ])

    await client.query('COMMIT')

    res.status(201).json(result.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')

    console.error('Erro ao cadastrar jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao cadastrar jogo'
    })
  } finally {
    client.release()
  }
}

// PUT - Atualizar jogo existente
const updateGame = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'ID inválido'
    })
  }

  const validationError = validateGame(req.body, true)

  if (validationError) {
    return res.status(400).json({
      message: validationError
    })
  }

  const {
    title,
    platform,
    hoursPlayed,
    timesCompleted,
    achievements,
    status,
    favorite,
    rawgId,
    imageUrl,
    showOnHome,
    isHero
  } = req.body

  let client

  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const currentResult = await client.query(`
      SELECT id, show_on_home, is_hero
      FROM games
      WHERE id = $1
      FOR UPDATE
    `, [id])

    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    const current = currentResult.rows[0]

    const nextIsHero = isHero ?? current.is_hero
    const nextShowOnHome = showOnHome ?? current.show_on_home

    if (nextIsHero && !nextShowOnHome) {
      await client.query('ROLLBACK')

      return res.status(400).json({
        message: 'O jogo do banner precisa aparecer no Início'
      })
    }

    if (isHero === true) {
      await client.query(`
        UPDATE games
        SET is_hero = FALSE
        WHERE is_hero = TRUE
          AND id <> $1
      `, [id])
    }

    const result = await client.query(`
      UPDATE games
      SET
        title = COALESCE($1, title),
        platform = COALESCE($2, platform),
        hours_played = COALESCE($3, hours_played),
        times_completed = COALESCE($4, times_completed),
        achievements = COALESCE($5, achievements),
        status = COALESCE($6, status),
        favorite = COALESCE($7, favorite),
        rawg_id = COALESCE($8, rawg_id),
        image_url = COALESCE($9, image_url),
        show_on_home = COALESCE($10, show_on_home),
        is_hero = COALESCE($11, is_hero)
      WHERE id = $12
      RETURNING ${gameFields}
    `, [
      title?.trim() ?? null,
      platform?.trim() ?? null,
      hoursPlayed ?? null,
      timesCompleted ?? null,
      achievements ?? null,
      status ?? null,
      favorite ?? null,
      rawgId ?? null,
      imageUrl ?? null,
      showOnHome ?? null,
      isHero ?? null,
      id
    ])

    await client.query('COMMIT')

    res.json(result.rows[0])
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK')
    }

    console.error('Erro ao atualizar jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao atualizar jogo'
    })
  } finally {
    if (client) client.release()
  }
}

// DELETE - Excluir jogo
const deleteGame = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'ID inválido'
    })
  }

  try {
    const result = await pool.query(`
      DELETE FROM games
      WHERE id = $1
      RETURNING ${gameFields}
    `, [id])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    res.json({
      message: 'Jogo excluído com sucesso',
      game: result.rows[0]
    })
  } catch (error) {
    console.error('Erro ao excluir jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao excluir jogo'
    })
  }
}

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
}
