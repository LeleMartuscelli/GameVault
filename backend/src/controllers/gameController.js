
const pool = require('../config/database')

const validStatuses = [
  'Jogando',
  'Zerado',
  'Quero jogar',
  'Pausado',
  'Abandonado'
]

// Campos retornados pela API
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
  igdb_id AS "igdbId",
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
    igdbId,
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

  if (
    status !== undefined &&
    !validStatuses.includes(status)
  ) {
    return 'Status inválido'
  }

  const numbers = [
    hoursPlayed,
    timesCompleted,
    achievements
  ]

  if (
    numbers.some(
      value =>
        value !== undefined &&
        (!Number.isSafeInteger(value) || value < 0)
    )
  ) {
    return 'Os valores numéricos devem ser inteiros não negativos'
  }

  for (const [name, value] of [
    ['favorite', favorite],
    ['showOnHome', showOnHome],
    ['isHero', isHero]
  ]) {
    if (value !== undefined && typeof value !== 'boolean') {
      return `${name} deve ser verdadeiro ou falso`
    }
  }

  for (const [name, value] of [
    ['rawgId', rawgId],
    ['igdbId', igdbId]
  ]) {
    if (
      value !== undefined &&
      value !== null &&
      (!Number.isSafeInteger(value) || value <= 0)
    ) {
      return `${name} inválido`
    }
  }

  if (
    rawgId != null &&
    igdbId != null
  ) {
    return 'Informe apenas um identificador de catálogo'
  }

  if (imageUrl !== undefined && imageUrl !== null) {
    if (
      typeof imageUrl !== 'string' ||
      imageUrl.length > 2048
    ) {
      return 'URL da imagem inválida'
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

function handleDatabaseError(res, error, action) {
  console.error(`Erro ao ${action} jogo:`, error.message)

  if (error.code === '23505') {
    return res.status(409).json({
      message: 'Este jogo já está cadastrado nessa plataforma ou o destaque principal está em conflito.'
    })
  }

  return res.status(500).json({
    message: `Erro interno ao ${action} jogo`
  })
}

// GET - Listar todos
const getGames = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ${gameFields}
      FROM games
      ORDER BY id
    `)

    res.json(result.rows)
  } catch (error) {
    handleDatabaseError(res, error, 'listar')
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

    if (!result.rows.length) {
      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    handleDatabaseError(res, error, 'buscar')
  }
}

// POST - Cadastrar novo jogo
const createGame = async (req, res) => {
  const data = req.body || {}
  const error = validateGame(data)

  if (error) {
    return res.status(400).json({ message: error })
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
    igdbId = null,
    imageUrl = null,
    showOnHome = true,
    isHero = false
  } = data

  let client
  let transactionStarted = false

  try {
    client = await pool.connect()

    await client.query('BEGIN')
    transactionStarted = true

    // Evita operações simultâneas conflitantes
    // ao cadastrar jogos ou alterar o banner.
    await client.query(
      'SELECT pg_advisory_xact_lock(624810)'
    )

    const duplicate = await client.query(`
      SELECT id
      FROM games
      WHERE LOWER(title) = LOWER($1)
        AND LOWER(platform) = LOWER($2)
         OR (
          LOWER(platform) = LOWER($2)
          AND (
            ($3::integer IS NOT NULL AND rawg_id = $3)
            OR
            ($4::integer IS NOT NULL AND igdb_id = $4)
          )
        )
      LIMIT 1
    `, [
      title.trim(),
      platform.trim(),
      rawgId,
      igdbId
    ])

    if (duplicate.rows.length) {
      await client.query('ROLLBACK')
      transactionStarted = false

      return res.status(409).json({
        message: 'Este jogo já está cadastrado nessa plataforma'
      })
    }

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
        igdb_id,
        image_url,
        show_on_home,
        is_hero
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
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
      igdbId,
      imageUrl,
      isHero ? true : showOnHome,
      isHero
    ])

    await client.query('COMMIT')
    transactionStarted = false

    res.status(201).json(result.rows[0])
  } catch (error) {
    if (client && transactionStarted) {
      await client.query('ROLLBACK').catch(() => {})
    }

    handleDatabaseError(res, error, 'cadastrar')
  } finally {
    if (client) client.release()
  }
}

// PUT - Atualizar jogo
const updateGame = async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: 'ID inválido'
    })
  }

  const data = req.body || {}
  const validationError = validateGame(data, true)

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
    igdbId,
    imageUrl,
    showOnHome,
    isHero
  } = data

  let client
  let transactionStarted = false

  try {
    client = await pool.connect()

    await client.query('BEGIN')
    transactionStarted = true

    await client.query(
      'SELECT pg_advisory_xact_lock(624810)'
    )

    const currentResult = await client.query(`
      SELECT *
      FROM games
      WHERE id = $1
      FOR UPDATE
    `, [id])

    if (!currentResult.rows.length) {
      await client.query('ROLLBACK')
      transactionStarted = false

      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    const current = currentResult.rows[0]

    const nextIsHero = isHero ?? current.is_hero
    const nextShowOnHome =
      showOnHome ?? current.show_on_home

    if (nextIsHero && !nextShowOnHome) {
      await client.query('ROLLBACK')
      transactionStarted = false

      return res.status(400).json({
        message: 'O jogo do banner precisa aparecer no Início'
      })
    }

    const nextRawgId = rawgId ?? current.rawg_id
    const nextIgdbId = igdbId ?? current.igdb_id

    if (nextRawgId != null && nextIgdbId != null) {
      await client.query('ROLLBACK')
      transactionStarted = false

      return res.status(400).json({
        message: 'O jogo não pode ter dois identificadores de catálogo'
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
        igdb_id = COALESCE($9, igdb_id),
        image_url = COALESCE($10, image_url),
        show_on_home = COALESCE($11, show_on_home),
        is_hero = COALESCE($12, is_hero)
      WHERE id = $13
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
      igdbId ?? null,
      imageUrl ?? null,
      showOnHome ?? null,
      isHero ?? null,
      id
    ])

    await client.query('COMMIT')
    transactionStarted = false

    res.json(result.rows[0])
  } catch (error) {
    if (client && transactionStarted) {
      await client.query('ROLLBACK').catch(() => {})
    }

    handleDatabaseError(res, error, 'atualizar')
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

    if (!result.rows.length) {
      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    res.json({
      message: 'Jogo excluído com sucesso',
      game: result.rows[0]
    })
  } catch (error) {
    handleDatabaseError(res, error, 'excluir')
  }
}

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
}
