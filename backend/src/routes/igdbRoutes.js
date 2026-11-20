
const express = require('express')

const router = express.Router()

const IGDB_URL = 'https://api.igdb.com/v4'

let cachedToken = null
let tokenExpiresAt = 0

// AUTENTICAÇÃO TWITCH

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais da Twitch não configuradas.')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  })

  const response = await fetch(
    'https://id.twitch.tv/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params,
      signal: AbortSignal.timeout(10000)
    }
  )

  if (!response.ok) {
    throw new Error(
      `Falha na autenticação Twitch (${response.status}).`
    )
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('A Twitch não retornou um token.')
  }

  cachedToken = data.access_token

  tokenExpiresAt =
    Date.now() +
    Math.max(0, data.expires_in - 60) * 1000

  return cachedToken
}

// CAMPOS UTILIZADOS PELO GAMEVAULT

const GAME_FIELDS = `
  name,
  slug,
  summary,
  first_release_date,
  cover.image_id,
  genres.name,
  platforms.name,
  total_rating,
  total_rating_count,
  hypes
`

// FORMATAÇÃO DOS JOGOS

function formatGame(game) {
  return {
    id: game.id,
    name: game.name,
    slug: game.slug || '',
    description: game.summary || '',

    released: game.first_release_date
      ? new Date(game.first_release_date * 1000)
          .toISOString()
          .slice(0, 10)
      : null,

    imageUrl: game.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,

    rating: game.total_rating ?? null,
    ratingCount: game.total_rating_count ?? 0,
    hypes: game.hypes ?? 0,

    genres: game.genres || [],
    platforms: game.platforms || []
  }
}

// CONSULTA À IGDB

async function queryIgdb(query) {
  const token = await getAccessToken()

  const response = await fetch(
    `${IGDB_URL}/games`,
    {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain'
      },
      body: query,
      signal: AbortSignal.timeout(10000)
    }
  )

  if (!response.ok) {
    throw new Error(
      `Consulta IGDB falhou (${response.status}).`
    )
  }

  return response.json()
}

// TRATAMENTO DE ERROS

function handleIgdbError(res, error) {
  console.error('Erro IGDB:', error.message)

  return res.status(502).json({
    success: false,
    source: 'IGDB',
    message: 'Não foi possível consultar a IGDB.'
  })
}

// FILTROS GERAIS DO CATÁLOGO

// PC, PS4, PS5, Xbox One, Xbox Series,
// Nintendo Switch e Nintendo Switch 2.
// A sintaxe (6,48,...) aceita qualquer uma
// das plataformas informadas.

const baseFilter = `
  game_type = 0
  & cover != null
  & version_parent = null
  & platforms = (6,48,49,130,167,169,508)
`

// ROTA DE TESTE

router.get('/test', async (req, res) => {
  try {
    const query = `
      fields ${GAME_FIELDS};
      where ${baseFilter};
      sort total_rating_count desc;
      limit 10;
    `

    const games = await queryIgdb(query)
    const results = games.map(formatGame)

    res.json({
      success: true,
      source: 'IGDB',
      count: results.length,
      results
    })
  } catch (error) {
    return handleIgdbError(res, error)
  }
})

// SEÇÕES DO CATÁLOGO

router.get('/sections/:section', async (req, res) => {
  const { section } = req.params

  const allowedSections = [
    'popular',
    'recent',
    'upcoming'
  ]

  if (!allowedSections.includes(section)) {
    return res.status(400).json({
      success: false,
      message: 'Categoria inválida.'
    })
  }

  const now = Date.now()
  const today = Math.floor(now / 1000)

  const daysAgo = (days) =>
    Math.floor((now - days * 86400000) / 1000)

  const daysAhead = (days) =>
    Math.floor((now + days * 86400000) / 1000)

  let condition = ''
  let sorting = ''

  // POPULARES: ÚLTIMOS DOIS ANOS

  if (section === 'popular') {
    condition = `
      ${baseFilter}
      & first_release_date >= ${daysAgo(730)}
      & first_release_date <= ${today}
      & total_rating_count >= 5
    `

    sorting = 'total_rating_count desc'
  }

  // LANÇAMENTOS RECENTES: ÚLTIMOS 180 DIAS

  if (section === 'recent') {
    condition = `
      ${baseFilter}
      & first_release_date >= ${daysAgo(180)}
      & first_release_date <= ${today}
    `

    sorting = 'total_rating_count desc'
  }

  // PRÓXIMOS LANÇAMENTOS: ATÉ 365 DIAS

  if (section === 'upcoming') {
    condition = `
      ${baseFilter}
      & first_release_date > ${today}
      & first_release_date <= ${daysAhead(365)}
    `

    sorting = 'hypes desc'
  }

  const query = `
    fields ${GAME_FIELDS};
    where ${condition};
    sort ${sorting};
    limit 20;
  `

  try {
    const games = await queryIgdb(query)
    const results = games.map(formatGame)

    res.json({
      success: true,
      source: 'IGDB',
      section,
      count: results.length,
      results
    })
  } catch (error) {
    return handleIgdbError(res, error)
  }
})

module.exports = router


 // PESQUISAR JOGOS PELO NOME

router.get('/search', async (req, res) => {
  const search = typeof req.query.q === 'string'
    ? req.query.q
        .trim()
        .slice(0, 80)
        .replace(/[";\\\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''

  if (!search) {
    return res.status(400).json({
      success: false,
      message: 'Informe o nome do jogo.'
    })
  }

  const page = Math.max(
    1,
    Math.min(100, Number.parseInt(req.query.page, 10) || 1)
  )

  const pageSize = 20

  const query = `
    search "${search}";
    fields ${GAME_FIELDS};
    where game_type = 0
      & version_parent = null
      & cover != null;
    limit ${pageSize + 1};
    offset ${(page - 1) * pageSize};
  `

  try {
    const games = await queryIgdb(query)
    const results = games.slice(0, pageSize).map(formatGame)

    res.json({
      success: true,
      source: 'IGDB',
      search,
      page,
      count: results.length,
      hasNext: games.length > pageSize,
      results
    })
  } catch (error) {
    return handleIgdbError(res, error)
  }
})

// DETALHES DE UM JOGO

router.get('/games/:id', async (req, res) => {
  const id = Number(req.params.id)

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: 'ID do jogo inválido.'
    })
  }

  const query = `
    fields ${GAME_FIELDS};
    where id = ${id};
    limit 1;
  `

  try {
    const games = await queryIgdb(query)

    if (!games.length) {
      return res.status(404).json({
        success: false,
        message: 'Jogo não encontrado.'
      })
    }

    res.json({
      success: true,
      source: 'IGDB',
      game: formatGame(games[0])
    })
  } catch (error) {
    return handleIgdbError(res, error)
  }
})

