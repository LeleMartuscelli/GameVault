
const pool = require('../config/database')

const MAX_AVATAR_SIZE = 2 * 1024 * 1024
const MAX_BANNER_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
]

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

  return null
}

function validateImageType(value) {
  return value === 'avatar' || value === 'banner'
}

// POST /api/profile/image/:type
async function uploadProfileImage(req, res) {
  const type = req.params.type
  const file = req.file

  if (!validateImageType(type)) {
    return res.status(400).json({
      message: 'Tipo de imagem inválido.'
    })
  }

  if (!file || !Buffer.isBuffer(file.buffer)) {
    return res.status(400).json({
      message: 'Selecione uma imagem válida.'
    })
  }

  const maxSize = type === 'avatar'
    ? MAX_AVATAR_SIZE
    : MAX_BANNER_SIZE

  if (file.size === 0 || file.size > maxSize) {
    return res.status(413).json({
      message: `A imagem deve ter até ${
        type === 'avatar' ? 2 : 5
      } MB.`
    })
  }

  const detectedType = detectImageType(file.buffer)

  if (
    !detectedType ||
    !ALLOWED_TYPES.includes(file.mimetype) ||
    detectedType !== file.mimetype
  ) {
    return res.status(400).json({
      message: 'Envie uma imagem JPG, PNG ou WebP válida.'
    })
  }

  const imageUrl = `/api/profile/image/${type}`

  let client

  try {
    client = await pool.connect()
    await client.query('BEGIN')

    const result = await client.query(
      `INSERT INTO profile_images (
         profile_id,
         image_type,
         file_data,
         mime_type,
         file_size
       )
       VALUES (1, $1, $2, $3, $4)
       ON CONFLICT (profile_id, image_type)
       DO UPDATE SET
         file_data = EXCLUDED.file_data,
         mime_type = EXCLUDED.mime_type,
         file_size = EXCLUDED.file_size,
         updated_at = NOW()
       RETURNING updated_at`,
      [type, file.buffer, detectedType, file.size]
    )

    const column = type === 'avatar'
      ? 'avatar_url'
      : 'banner_url'

    const profileResult = await client.query(
      `UPDATE profiles
       SET ${column} = $1,
           updated_at = NOW()
       WHERE id = 1
       RETURNING id`,
      [imageUrl]
    )

    if (profileResult.rowCount === 0) {
      throw new Error('Perfil administrativo não encontrado')
    }

    await client.query('COMMIT')

    return res.json({
      message: 'Imagem atualizada com sucesso.',
      imageUrl,
      updatedAt: result.rows[0].updated_at
    })
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Erro no rollback:', rollbackError)
      }
    }

    console.error('Erro ao salvar imagem:', error)

    return res.status(500).json({
      message: 'Não foi possível salvar a imagem.'
    })
  } finally {
    if (client) client.release()
  }
}

// GET /api/profile/image/:type
async function getProfileImage(req, res) {
  const type = req.params.type

  if (!validateImageType(type)) {
    return res.status(400).json({
      message: 'Tipo de imagem inválido.'
    })
  }

  try {
    const result = await pool.query(
      `SELECT file_data, mime_type, file_size
       FROM profile_images
       WHERE profile_id = 1
         AND image_type = $1`,
      [type]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Imagem não encontrada.'
      })
    }

    const file = result.rows[0]

    if (
      !ALLOWED_TYPES.includes(file.mime_type) ||
      detectImageType(file.file_data) !== file.mime_type
    ) {
      return res.status(415).json({
        message: 'Formato de imagem inválido.'
      })
    }

    res.set({
      'Content-Type': file.mime_type,
      'Content-Length': file.file_size,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline'
    })

    return res.send(file.file_data)
  } catch (error) {
    console.error('Erro ao buscar imagem:', error)

    return res.status(500).json({
      message: 'Não foi possível carregar a imagem.'
    })
  }
}

module.exports = {
  uploadProfileImage,
  getProfileImage
}
