
const express = require('express')
const multer = require('multer')

const {
  getProfile,
  updateProfile
} = require('../controllers/profileController')

const {
  uploadProfileImage,
  getProfileImage
} = require('../controllers/profileImageController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
]

// Configuração do upload
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
    fields: 0
  },

  fileFilter(req, file, callback) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return callback(
        new Error('Envie apenas imagens JPG, PNG ou WebP.')
      )
    }

    callback(null, true)
  }
})

// Tratamento de erros do Multer
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

// GET - Consultar perfil
router.get('/', requireAdmin, getProfile)

// PUT - Atualizar informações do perfil
router.put('/', requireAdmin, requireCsrf, updateProfile)

// GET - Consultar imagem
router.get(
  '/image/:type',
  requireAdmin,
  getProfileImage
)

// POST - Enviar foto ou banner
router.post(
  '/image/:type',
  requireAdmin,
  requireCsrf,
  handleUpload,
  uploadProfileImage
)

module.exports = router
