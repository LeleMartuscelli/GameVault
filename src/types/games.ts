export type GameStatus =
  | 'Jogando'
  | 'Zerado'
  | 'Quero jogar'
  | 'Pausado'
  | 'Abandonado'

export interface Game {
  id: number
  title: string
  platform: string
  hoursPlayed: number
  timesCompleted: number
  achievements: number
  status: GameStatus
}