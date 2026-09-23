const games = require('../data/games')

const getGames = (req, res) => {
  res.json(games)
}

const getGameById = (req, res) => {
  const id = Number(req.params.id)

  const game = games.find((game) => game.id === id)

  if (!game) {
    return res.status(404).json({
      message: 'Jogo não encontrado'
    })
  }

  res.json(game)
}

const createGame = (req, res) => {
  const {
    title,
    platform,
    hoursPlayed,
    timesCompleted,
    achievements,
    status,
    favorite
  } = req.body

  if (!title || !platform || !status) {
    return res.status(400).json({
      message: 'Título, plataforma e status são obrigatórios'
    })
  }

  if (
    hoursPlayed < 0 ||
    timesCompleted < 0 ||
    achievements < 0
  ) {
    return res.status(400).json({
      message: 'Os valores numéricos não podem ser negativos'
    })
  }

  const newGame = {
    id: games.length + 1,
    title,
    platform,
    hoursPlayed: hoursPlayed ?? 0,
    timesCompleted: timesCompleted ?? 0,
    achievements: achievements ?? 0,
    status,
    favorite: favorite ?? false
  }

  games.push(newGame)

  res.status(201).json(newGame)
}

const updateGame = (req, res) => {
  const id = Number(req.params.id)

  const game = games.find((game) => game.id === id)

  if (!game) {
    return res.status(404).json({
      message: 'Jogo não encontrado'
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
    hoursPlayed < 0 ||
    timesCompleted < 0 ||
    achievements < 0
  ) {
    return res.status(400).json({
      message: 'Os valores numéricos não podem ser negativos'
    })
  }

  game.title = title ?? game.title
  game.platform = platform ?? game.platform
  game.hoursPlayed = hoursPlayed ?? game.hoursPlayed
  game.timesCompleted = timesCompleted ?? game.timesCompleted
  game.achievements = achievements ?? game.achievements
  game.status = status ?? game.status
  game.favorite = favorite ?? game.favorite

  res.json(game)
}

const deleteGame = (req, res) => {
  const id = Number(req.params.id)

  const gameIndex = games.findIndex((game) => game.id === id)

  if (gameIndex === -1) {
    return res.status(404).json({
      message: 'Jogo não encontrado'
    })
  }

  const deletedGame = games.splice(gameIndex, 1)

  res.json({
    message: 'Jogo excluído com sucesso',
    game: deletedGame[0]
  })
}

module.exports = {
  getGames,
  getGameById,
  createGame,
  updateGame,
  deleteGame
}