
const crypto = require('node:crypto')

function requireCsrf(req, res, next) {
  const expectedToken = req.session?.csrfToken
  const receivedToken = req.get('X-CSRF-Token')

  if (!expectedToken || !receivedToken) {
    return res.status(403).json({
      message: 'Token de segurança ausente.'
    })
  }

  const expected = Buffer.from(expectedToken, 'utf8')
  const received = Buffer.from(receivedToken, 'utf8')

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return res.status(403).json({
      message: 'Token de segurança inválido.'
    })
  }

  next()
}

module.exports = requireCsrf
