
const express = require('express')

const {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
} = require('../controllers/gameController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

// Consultas públicas
router.get('/', getGames)
router.get('/:id', getGameById)

// Alterações exclusivas da administradora
router.post('/', requireAdmin, requireCsrf, createGame)
router.put('/:id', requireAdmin, requireCsrf, updateGame)
router.delete('/:id', requireAdmin, requireCsrf, deleteGame)

module.exports = router
