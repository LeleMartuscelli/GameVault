
const express = require('express')

const {
  getGameMedia,
  createGameMedia,
  deleteGameMedia
} = require('../controllers/galleryController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

// Visualização pública
router.get('/game/:gameId', getGameMedia)

// Gerenciamento exclusivo da administradora
router.post(
  '/game/:gameId',
  requireAdmin,
  requireCsrf,
  createGameMedia
)

router.delete(
  '/:id',
  requireAdmin,
  requireCsrf,
  deleteGameMedia
)

module.exports = router
