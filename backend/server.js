const express = require('express')
const gameRoutes = require('./src/routes/gameRoutes')

const app = express()

const PORT = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'API do GameVault funcionando!'
  })
})

app.use('/api/games', gameRoutes)

app.listen(PORT, () => {
  console.log(`Servidor GameVault rodando na porta ${PORT}`)
})