
const express = require('express')
const rateLimit = require('express-rate-limit')

const {
  login,
  me,
  logout
} = require('../controllers/authController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Muitas tentativas. Tente novamente mais tarde.'
  }
})

// Login administrativo
router.post('/login', loginLimiter, login)

// Verificar sessão
router.get('/me', me)

// Logout protegido
router.post('/logout', requireAdmin, requireCsrf, logout)

module.exports = router
