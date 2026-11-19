
const express = require('express')

const {
  getProfile,
  updateProfile
} = require('../controllers/profileController')

const requireAdmin = require('../middleware/requireAdmin')
const requireCsrf = require('../middleware/requireCsrf')

const router = express.Router()

// GET - Consultar o perfil administrativo
router.get('/', requireAdmin, getProfile)

// PUT - Atualizar o perfil administrativo
router.put('/', requireAdmin, requireCsrf, updateProfile)

module.exports = router
