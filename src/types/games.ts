
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
  favorite: boolean

  // Identificadores dos catálogos
  rawgId?: number | null
  igdbId?: number | null

  // Imagem do jogo
  imageUrl?: string | null

  // Personalização do Início
  showOnHome?: boolean
  isHero?: boolean
}
