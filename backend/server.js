
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const session = require('express-session')
const PgSession = require('connect-pg-simple')(session)

const pool = require('./src/config/database')
const gameRoutes = require('./src/routes/gameRoutes')
const authRoutes = require('./src/routes/authRoutes')
const galleryRoutes = require('./src/routes/galleryRoutes')

const app = express()
const PORT = process.env.PORT || 3000

const isProduction = process.env.NODE_ENV === 'production'
const frontendUrl = process.env.FRONTEND_URL

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET não configurada')
}

if (!frontendUrl) {
  throw new Error('FRONTEND_URL não configurada')
}

if (isProduction) {
  app.set('trust proxy', 1)
}

app.use(helmet())

app.use(cors({
  origin: frontendUrl,
  credentials: true
}))

app.use(express.json({ limit: '100kb' }))

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  name: 'gamevault.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 8
  }
}))

app.get('/', (req, res) => {
  res.json({
    message: 'API do GameVault funcionando!'
  })
})

// Jogos
app.use('/api/games', gameRoutes)

// Autenticação
app.use('/api/auth', authRoutes)

// Galeria
app.use('/api/gallery', galleryRoutes)

app.listen(PORT, () => {
  console.log(`Servidor GameVault rodando na porta ${PORT}`)
})
