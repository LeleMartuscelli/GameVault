import { games } from './games'

export type Game = {
  id: number
  title: string
  hoursPlayed: number
  timesCompleted: number
  achievements: number
  image?: string
  favorite?: boolean
}

const STORAGE_KEY = 'gamevault-games'

function normalizeGames(gameList: Game[]): Game[] {
  return gameList.map((game) => ({
    ...game,
    favorite: game.favorite ?? false,
  }))
}

export function getStoredGames(): Game[] {
  const savedGames = localStorage.getItem(STORAGE_KEY)

  if (!savedGames) {
    const initialGames = normalizeGames(games)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialGames)
    )

    return initialGames
  }

  try {
    const parsedGames = JSON.parse(savedGames) as Game[]

    const normalizedGames = normalizeGames(parsedGames)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalizedGames)
    )

    return normalizedGames
  } catch {
    const initialGames = normalizeGames(games)

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialGames)
    )

    return initialGames
  }
}

export function getAllGames(): Game[] {
  return getStoredGames()
}

export function saveStoredGames(games: Game[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(games)
  )
}

export function addGame(game: Game) {
  const storedGames = getStoredGames()

  const newGame = {
    ...game,
    favorite: game.favorite ?? false,
  }

  const updatedGames = [
    ...storedGames,
    newGame,
  ]

  saveStoredGames(updatedGames)
}

export function findGameById(id: string | number) {
  const allGames = getStoredGames()

  return allGames.find(
    (game) => String(game.id) === String(id)
  )
}

export function deleteGame(id: string | number) {
  const storedGames = getStoredGames()

  const updatedGames = storedGames.filter(
    (game) => String(game.id) !== String(id)
  )

  saveStoredGames(updatedGames)
}

export function updateGame(updatedGame: Game) {
  const storedGames = getStoredGames()

  const updatedGames = storedGames.map((game) =>
    String(game.id) === String(updatedGame.id)
      ? {
          ...updatedGame,
          favorite:
            updatedGame.favorite ??
            game.favorite ??
            false,
        }
      : game
  )

  saveStoredGames(updatedGames)
}

export function toggleFavorite(id: string | number) {
  const storedGames = getStoredGames()

  const updatedGames = storedGames.map((game) =>
    String(game.id) === String(id)
      ? {
          ...game,
          favorite: !game.favorite,
        }
      : game
  )

  saveStoredGames(updatedGames)

  return updatedGames.find(
    (game) => String(game.id) === String(id)
  )
}

export function getFavoriteGames(): Game[] {
  return getStoredGames().filter(
    (game) => game.favorite === true
  )
}