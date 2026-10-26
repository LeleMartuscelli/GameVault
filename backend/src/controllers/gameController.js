
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
  favorite
`

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
  const {
    title,
    platform,
    hoursPlayed = 0,
    timesCompleted = 0,
    achievements = 0,
    status,
    favorite = false
  } = req.body

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof platform !== 'string' ||
    !platform.trim() ||
    !status
  ) {
    return res.status(400).json({
      message: 'Título, plataforma e status são obrigatórios'
    })
  }

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Status inválido'
    })
  }

  const numbers = [
    hoursPlayed,
    timesCompleted,
    achievements
  ]

  if (numbers.some(value =>
    !Number.isSafeInteger(value) || value < 0
  )) {
    return res.status(400).json({
      message: 'Os valores numéricos devem ser inteiros não negativos'
    })
  }

  if (typeof favorite !== 'boolean') {
    return res.status(400).json({
      message: 'Favorito deve ser verdadeiro ou falso'
    })
  }

  try {
    const result = await pool.query(`
      INSERT INTO games (
        title,
        platform,
        hours_played,
        times_completed,
        achievements,
        status,
        favorite
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${gameFields}
    `, [
      title.trim(),
      platform.trim(),
      hoursPlayed,
      timesCompleted,
      achievements,
      status,
      favorite
    ])

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Erro ao cadastrar jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao cadastrar jogo'
    })
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

  const {
    title,
    platform,
    hoursPlayed,
    timesCompleted,
    achievements,
    status,
    favorite
  } = req.body

  if (
    (title !== undefined &&
      (typeof title !== 'string' || !title.trim())) ||
    (platform !== undefined &&
      (typeof platform !== 'string' || !platform.trim()))
  ) {
    return res.status(400).json({
      message: 'Título e plataforma devem ser textos não vazios'
    })
  }

  if (
    status !== undefined &&
    !validStatuses.includes(status)
  ) {
    return res.status(400).json({
      message: 'Status inválido'
    })
  }

  const numbers = [
    hoursPlayed,
    timesCompleted,
    achievements
  ]

  if (numbers.some(value =>
    value !== undefined &&
    (!Number.isSafeInteger(value) || value < 0)
  )) {
    return res.status(400).json({
      message: 'Os valores numéricos devem ser inteiros não negativos'
    })
  }

  if (
    favorite !== undefined &&
    typeof favorite !== 'boolean'
  ) {
    return res.status(400).json({
      message: 'Favorito deve ser verdadeiro ou falso'
    })
  }

  try {
    const result = await pool.query(`
      UPDATE games
      SET
        title = COALESCE($1, title),
        platform = COALESCE($2, platform),
        hours_played = COALESCE($3, hours_played),
        times_completed = COALESCE($4, times_completed),
        achievements = COALESCE($5, achievements),
        status = COALESCE($6, status),
        favorite = COALESCE($7, favorite)
      WHERE id = $8
      RETURNING ${gameFields}
    `, [
      title?.trim() ?? null,
      platform?.trim() ?? null,
      hoursPlayed ?? null,
      timesCompleted ?? null,
      achievements ?? null,
      status ?? null,
      favorite ?? null,
      id
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Jogo não encontrado'
      })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Erro ao atualizar jogo:', error.message)

    res.status(500).json({
      message: 'Erro interno ao atualizar jogo'
    })
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
