
const express = require('express')
const multer = require('multer')

const {
  getGameMedia,
  createGameMedia,
  uploadGameMedia,
  getMediaFile,
  deleteGameMedia
} = require('../controllers/galleryController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 1,
    fieldSize: 1024
  },

  fileFilter(req, file, callback) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(
        new Error('Envie apenas imagens JPG, PNG, WebP ou GIF.')
      )
    }

    callback(null, true)
  }
})

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: 'A imagem deve ter no máximo 5 MB.'
        })
      }

      return res.status(400).json({
        message: 'Não foi possível receber a imagem.'
      })
    }

    return res.status(400).json({
      message: error.message || 'Imagem inválida.'
    })
  })
}

// Consultas públicas
router.get('/game/:gameId', getGameMedia)
router.get('/file/:id', getMediaFile)

// Cadastro por URL - administradora
router.post(
  '/game/:gameId',
  requireAdmin,
  requireCsrf,
  createGameMedia
)

// Upload de imagem - administradora
router.post(
  '/game/:gameId/upload',
  requireAdmin,
  requireCsrf,
  handleUpload,
  uploadGameMedia
)

// Exclusão - administradora
router.delete(
  '/:id',
  requireAdmin,
  requireCsrf,
  deleteGameMedia
)

module.exports = router
