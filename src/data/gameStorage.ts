import { games } from './games'

export type Game = {
  id: number
  title: string
  hoursPlayed: number
  timesCompleted: number
  achievements: number
  image?: string
}

const STORAGE_KEY = 'gamevault-games'

export function getStoredGames(): Game[] {
  const savedGames = localStorage.getItem(STORAGE_KEY)

  if (!savedGames) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(games)
    )

    return games
  }

  try {
    return JSON.parse(savedGames)
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(games)
    )

    return games
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

  const updatedGames = [
    ...storedGames,
    game,
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
      ? updatedGame
      : game
  )

  saveStoredGames(updatedGames)
}