
const pool = require('../config/database')

function parseId(value) {
  const id = Number(value)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
}

function formatMedia(row) {
  return {
    id: row.id,
    gameId: row.game_id,
    mediaType: row.media_type,
    mediaUrl: row.media_url,
    caption: row.caption,
    createdAt: row.created_at
  }
}

function validateMediaUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) {
    return false
  }

  try {
    const url = new URL(value)

    return (
      ['https:', 'http:'].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}

// GET /api/gallery/game/:gameId
// Acesso público
async function getGameMedia(req, res) {
  const gameId = parseId(req.params.gameId)

  if (!gameId) {
    return res.status(400).json({
      message: 'ID do jogo inválido.'
    })
  }

  try {
    const result = await pool.query(
      `SELECT id, game_id, media_type, media_url,
              caption, created_at
       FROM game_media
       WHERE game_id = $1
       ORDER BY created_at DESC, id DESC`,
      [gameId]
    )

    return res.json(result.rows.map(formatMedia))
  } catch (error) {
    console.error('Erro ao buscar galeria:', error)

    return res.status(500).json({
      message: 'Erro ao carregar a galeria.'
    })
  }
}

// POST /api/gallery/game/:gameId
// Exclusivo da administradora
async function createGameMedia(req, res) {
  const gameId = parseId(req.params.gameId)
  const { mediaType, mediaUrl, caption } = req.body || {}

  if (!gameId) {
    return res.status(400).json({
      message: 'ID do jogo inválido.'
    })
  }

  if (!['image', 'video'].includes(mediaType)) {
    return res.status(400).json({
      message: 'Tipo de mídia inválido.'
    })
  }

  if (!validateMediaUrl(mediaUrl)) {
    return res.status(400).json({
      message: 'Informe uma URL válida de imagem ou vídeo.'
    })
  }

  if (
    caption !== undefined &&
    caption !== null &&
    (typeof caption !== 'string' || caption.length > 255)
  ) {
    return res.status(400).json({
      message: 'A legenda deve ter até 255 caracteres.'
    })
  }

  try {
    const gameResult = await pool.query(
      'SELECT id FROM games WHERE id = $1',
      [gameId]
    )

    if (gameResult.rowCount === 0) {
      return res.status(404).json({
        message: 'Jogo não encontrado.'
      })
    }

    const result = await pool.query(
      `INSERT INTO game_media
         (game_id, media_type, media_url, caption)
       VALUES ($1, $2, $3, $4)
       RETURNING id, game_id, media_type,
                 media_url, caption, created_at`,
      [
        gameId,
        mediaType,
        mediaUrl.trim(),
        caption?.trim() || null
      ]
    )

    return res.status(201).json(formatMedia(result.rows[0]))
  } catch (error) {
    console.error('Erro ao adicionar mídia:', error)

    return res.status(500).json({
      message: 'Erro ao adicionar mídia.'
    })
  }
}

// DELETE /api/gallery/:id
// Exclusivo da administradora
async function deleteGameMedia(req, res) {
  const mediaId = parseId(req.params.id)

  if (!mediaId) {
    return res.status(400).json({
      message: 'ID da mídia inválido.'
    })
  }

  try {
    const result = await pool.query(
      'DELETE FROM game_media WHERE id = $1 RETURNING id',
      [mediaId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Mídia não encontrada.'
      })
    }

    return res.json({
      message: 'Mídia excluída com sucesso.'
    })
  } catch (error) {
    console.error('Erro ao excluir mídia:', error)

    return res.status(500).json({
      message: 'Erro ao excluir mídia.'
    })
  }
}

module.exports = {
  getGameMedia,
  createGameMedia,
  deleteGameMedia
}
