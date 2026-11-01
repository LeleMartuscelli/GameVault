
import warzoneImage from '../assets/games/call-of-duty-warzone.jpg'
import cs2Image from '../assets/games/counter-strike-2.jpg'
import tlouImage from '../assets/games/the-last-of-us-part-ii.jpg'
import arcRaidersImage from '../assets/games/arc-raiders.jpg'
import gtaVImage from '../assets/games/grand-theft-auto-v.jpg'
import mw4Image from '../assets/games/Modern-Warfare-4.jpg'
import plagueTaleImage from '../assets/games/A-Plague-Tale-Innocence.png'

export function getGameImage(title: string): string | null {
  const normalizedTitle = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

  if (
    normalizedTitle.includes('modern warfare 4')
  ) {
    return mw4Image
  }

  if (
    normalizedTitle.includes('warzone')
  ) {
    return warzoneImage
  }

  if (
    normalizedTitle.includes('counter strike 2')
  ) {
    return cs2Image
  }

  if (
    normalizedTitle.includes('the last of us part ii') ||
    normalizedTitle.includes('the last of us part 2')
  ) {
    return tlouImage
  }

  if (
    normalizedTitle.includes('arc raiders')
  ) {
    return arcRaidersImage
  }

  if (
    normalizedTitle === 'gta v' ||
    normalizedTitle === 'gta 5' ||
    normalizedTitle.includes('grand theft auto v')
  ) {
    return gtaVImage
  }
  
  if (normalizedTitle.includes('a plague tale innocence')) {
  return plagueTaleImage
}
  return null
}
