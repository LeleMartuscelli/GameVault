const express = require('express')
const {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
} = require('../controllers/gameController')

const router = express.Router()

router.get('/', getGames)
router.get('/:id', getGameById)
router.post('/', createGame)
router.put('/:id', updateGame)
router.delete('/:id', deleteGame)

module.exports = router