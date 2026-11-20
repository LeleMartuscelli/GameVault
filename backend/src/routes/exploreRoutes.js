const express = require('express')

const router = express.Router()
const BASE_URL = 'https://api.rawg.io/api'

const allowedOrdering = new Set([
  'name', '-name', 'released', '-released',
  'rating', '-rating', 'added', '-added',
  'metacritic', '-metacritic'
])

function gameSummary(game) {
  return {
    id: game.id,
    slug: game.slug,
    name: game.name,
    released: game.released,
    backgroundImage: game.background_image,
    rating: game.rating,
    metacritic: game.metacritic,
    genres: (game.genres || []).map(({ id, name, slug }) => ({ id, name, slug })),
    platforms: (game.platforms || []).map(({ platform }) => ({
      id: platform.id,
      name: platform.name,
      slug: platform.slug
    }))
  }
}

async function callRawg(path, params = {}) {
  if (!process.env.RAWG_API_KEY) {
    const error = new Error('RAWG_API_KEY não configurada no backend.')
    error.statusCode = 503
    throw error
  }

  const url = new URL(BASE_URL + path)
  url.searchParams.set('key', process.env.RAWG_API_KEY)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  let response
  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    })
  } catch (error) {
    const upstreamError = new Error('Não foi possível conectar ao catálogo de jogos.')
    upstreamError.statusCode = 502
    throw upstreamError
  }

  if (!response.ok) {
    const error = new Error(
      response.status === 429
        ? 'Limite de requisições da RAWG atingido. Tente novamente mais tarde.'
        : 'O catálogo de jogos está indisponível no momento.'
    )
    error.statusCode = response.status === 429 ? 429 : 502
    throw error
  }

  return response.json()
}

router.get('/games', async (req, res) => {
  try {
    const search = typeof req.query.search === 'string'
      ? req.query.search.trim().slice(0, 100)
      : ''
    const page = Math.max(1, Math.min(100, Number.parseInt(req.query.page, 10) || 1))
    const pageSize = Math.max(1, Math.min(40, Number.parseInt(req.query.page_size, 10) || 20))
    const ordering = allowedOrdering.has(req.query.ordering) ? req.query.ordering : '-added'
    const genres = typeof req.query.genres === 'string' && /^[a-z0-9,-]{1,100}$/.test(req.query.genres)
      ? req.query.genres : undefined
    const platforms = typeof req.query.platforms === 'string' && /^[0-9,]{1,60}$/.test(req.query.platforms)
      ? req.query.platforms : undefined
    const year = Number.parseInt(req.query.year, 10)
    const dates = Number.isInteger(year) && year >= 1980 && year <= 2100
      ? `${year}-01-01,${year}-12-31` : undefined

    const data = await callRawg('/games', {
      search, page, page_size: pageSize, ordering, genres, platforms, dates
    })

    res.json({
      count: data.count,
      hasNext: Boolean(data.next),
      page,
      results: (data.results || []).map(gameSummary)
    })
  } catch (error) {
    console.error('Falha ao consultar RAWG:', error.message)
    res.status(error.statusCode || 500).json({ error: error.message || 'Falha ao buscar jogos.' })
  }
})

router.get('/games/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID do jogo inválido.' })
  }

  try {
    const game = await callRawg(`/games/${id}`)
    res.json({
      ...gameSummary(game),
      descriptionRaw: game.description_raw || '',
      website: game.website || null,
      developers: (game.developers || []).map(({ id, name }) => ({ id, name })),
      publishers: (game.publishers || []).map(({ id, name }) => ({ id, name }))
    })
  } catch (error) {
    console.error('Falha ao consultar detalhes RAWG:', error.message)
    res.status(error.statusCode || 500).json({ error: error.message || 'Falha ao buscar detalhes.' })
  }
})

module.exports = router
