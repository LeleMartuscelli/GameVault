
const pool = require('../config/database')

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

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

function validateCaption(value) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.length <= 255)
  )
}

function detectImageType(buffer) {
  if (!Buffer.isBuffer(buffer)) return null

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return 'image/jpeg'
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
      ])
    )
  ) {
    return 'image/png'
  }

  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp'
  }

  if (
    buffer.length >= 6 &&
    ['GIF87a', 'GIF89a'].includes(
      buffer.toString('ascii', 0, 6)
    )
  ) {
    return 'image/gif'
  }

  return null
}

// GET /api/gallery/game/:gameId
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
         AND media_type = 'image'
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
// Cadastro por URL
async function createGameMedia(req, res) {
  const gameId = parseId(req.params.gameId)
  const { mediaType, mediaUrl, caption } = req.body || {}

  if (!gameId) {
    return res.status(400).json({
      message: 'ID do jogo inválido.'
    })
  }

  if (mediaType !== 'image') {
    return res.status(400).json({
      message: 'A galeria aceita apenas imagens.'
    })
  }

  if (!validateMediaUrl(mediaUrl)) {
    return res.status(400).json({
      message: 'Informe uma URL HTTP ou HTTPS válida.'
    })
  }

  if (!validateCaption(caption)) {
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
        'image',
        mediaUrl.trim(),
        caption?.trim() || null
      ]
    )

    return res.status(201).json(formatMedia(result.rows[0]))
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error)

    return res.status(500).json({
      message: 'Erro ao adicionar imagem.'
    })
  }
}

// POST /api/gallery/game/:gameId/upload
async function uploadGameMedia(req, res) {
  const gameId = parseId(req.params.gameId)
  const file = req.file
  const caption = req.body?.caption

  if (!gameId) {
    return res.status(400).json({
      message: 'ID do jogo inválido.'
    })
  }

  if (!file || !Buffer.isBuffer(file.buffer)) {
    return res.status(400).json({
      message: 'Selecione uma imagem válida.'
    })
  }

  if (
    file.size === 0 ||
    file.size > MAX_IMAGE_SIZE
  ) {
    return res.status(413).json({
      message: 'A imagem deve ter até 5 MB.'
    })
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return res.status(400).json({
      message: 'Formato de imagem não permitido.'
    })
  }

  const detectedType = detectImageType(file.buffer)

  if (!detectedType || detectedType !== file.mimetype) {
    return res.status(400).json({
      message: 'O conteúdo do arquivo não corresponde a uma imagem válida.'
    })
  }

  if (!validateCaption(caption)) {
    return res.status(400).json({
      message: 'A legenda deve ter até 255 caracteres.'
    })
  }

  let client

  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const gameResult = await client.query(
      'SELECT id FROM games WHERE id = $1',
      [gameId]
    )

    if (gameResult.rowCount === 0) {
      await client.query('ROLLBACK')

      return res.status(404).json({
        message: 'Jogo não encontrado.'
      })
    }

    const mediaResult = await client.query(
      `INSERT INTO game_media
         (game_id, media_type, media_url, caption)
       VALUES ($1, 'image', $2, $3)
       RETURNING id, game_id, media_type,
                 media_url, caption, created_at`,
      [
        gameId,
        '/api/gallery/file/pending',
        caption?.trim() || null
      ]
    )

    const media = mediaResult.rows[0]
    const mediaUrl = `/api/gallery/file/${media.id}`

    await client.query(
      `UPDATE game_media
       SET media_url = $1
       WHERE id = $2`,
      [mediaUrl, media.id]
    )

    await client.query(
      `INSERT INTO game_media_files
         (media_id, file_data, mime_type, file_size)
       VALUES ($1, $2, $3, $4)`,
      [
        media.id,
        file.buffer,
        detectedType,
        file.size
      ]
    )

    await client.query('COMMIT')

    return res.status(201).json({
      ...formatMedia(media),
      mediaUrl
    })
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Erro ao desfazer upload:', rollbackError)
      }
    }

    console.error('Erro ao enviar imagem:', error)

    return res.status(500).json({
      message: 'Erro ao armazenar imagem.'
    })
  } finally {
    if (client) client.release()
  }
}

// GET /api/gallery/file/:id
async function getMediaFile(req, res) {
  const mediaId = parseId(req.params.id)

  if (!mediaId) {
    return res.status(400).json({
      message: 'ID da imagem inválido.'
    })
  }

  try {
    const result = await pool.query(
      `SELECT f.file_data, f.mime_type, f.file_size
       FROM game_media_files f
       JOIN game_media m ON m.id = f.media_id
       WHERE f.media_id = $1
         AND m.media_type = 'image'`,
      [mediaId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Imagem não encontrada.'
      })
    }

    const file = result.rows[0]

    if (!ALLOWED_TYPES.includes(file.mime_type)) {
      return res.status(415).json({
        message: 'Formato de arquivo não permitido.'
      })
    }

    res.set({
      'Content-Type': file.mime_type,
      'Content-Length': file.file_size,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline'
    })

    return res.send(file.file_data)
  } catch (error) {
    console.error('Erro ao carregar imagem:', error)

    return res.status(500).json({
      message: 'Erro ao carregar imagem.'
    })
  }
}

// DELETE /api/gallery/:id
async function deleteGameMedia(req, res) {
  const mediaId = parseId(req.params.id)

  if (!mediaId) {
    return res.status(400).json({
      message: 'ID da imagem inválido.'
    })
  }

  try {
    const result = await pool.query(
      `DELETE FROM game_media
       WHERE id = $1
         AND media_type = 'image'
       RETURNING id`,
      [mediaId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Imagem não encontrada.'
      })
    }

    return res.json({
      message: 'Imagem excluída com sucesso.'
    })
  } catch (error) {
    console.error('Erro ao excluir imagem:', error)

    return res.status(500).json({
      message: 'Erro ao excluir imagem.'
    })
  }
}

module.exports = {
  getGameMedia,
  createGameMedia,
  uploadGameMedia,
  getMediaFile,
  deleteGameMedia
}
