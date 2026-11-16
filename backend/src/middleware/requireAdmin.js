
function requireAdmin(req, res, next) {
  if (req.session?.isAdmin === true) {
    return next()
  }

  return res.status(401).json({
    message: 'Acesso restrito à administradora.'
  })
}

module.exports = requireAdmin
