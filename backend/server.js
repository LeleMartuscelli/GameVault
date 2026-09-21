const express = require('express')

const app = express()

const PORT = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API do GameVault funcionando!'
  })
})

app.get('/api/games', (req, res) => {
  const games = [
    {
      id: 1,
      title: 'Call of Duty: Warzone',
      platform: 'PC',
      hoursPlayed: 2000,
      timesCompleted: 0,
      achievements: 0,
      status: 'Jogando',
      favorite: false
    },
    {
      id: 2,
      title: 'Counter-Strike 2',
      platform: 'PC',
      hoursPlayed: 471,
      timesCompleted: 0,
      achievements: 0,
      status: 'Jogando',
      favorite: false
    },
    {
      id: 3,
      title: 'The Last of Us Part II',
      platform: 'PlayStation',
      hoursPlayed: 84,
      timesCompleted: 3,
      achievements: 0,
      status: 'Zerado',
      favorite: false
    }
  ]

  res.json(games)
})

app.listen(PORT, () => {
  console.log(`Servidor GameVault rodando na porta ${PORT}`)
})