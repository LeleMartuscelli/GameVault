import warzoneImage from '../assets/games/call-of-duty-warzone.jpg'
import cs2Image from '../assets/games/counter-strike-2.jpg'
import tlouImage from '../assets/games/the-last-of-us-part-ii.jpg'
import arcRaidersImage from '../assets/games/arc-raiders.jpg'
import gtaVImage from '../assets/games/grand-theft-auto-v.jpg'

export function getGameImage(title: string) {
  switch (title) {
    case 'Call of Duty: Warzone':
      return warzoneImage

    case 'Counter-Strike 2':
      return cs2Image

    case 'The Last of Us Part II':
      return tlouImage

    case 'ARC Raiders':
      return arcRaidersImage

    case 'GTA V':
      return gtaVImage

    default:
      return null
  }
}