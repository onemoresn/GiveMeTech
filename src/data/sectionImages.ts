import type { SectionId } from './sections'
import type { Article } from './articles'
import { assetPath } from '../utils/assetPath'

const paths: Record<SectionId, string> = {
  ai: 'images/topics/topic-ai-ml.png',
  cybersecurity: 'images/topics/topic-cybersecurity.png',
  gadgets: 'images/topics/topic-gadgets.png',
  software: 'images/topics/topic-software.png',
  space: 'images/topics/topic-space.png',
  gaming: 'images/topics/topic-gaming.png',
  cars: 'images/topics/topic-cars.png',
}

export const sectionImages: Record<SectionId, string> = {
  ai: assetPath(paths.ai),
  cybersecurity: assetPath(paths.cybersecurity),
  gadgets: assetPath(paths.gadgets),
  software: assetPath(paths.software),
  space: assetPath(paths.space),
  gaming: assetPath(paths.gaming),
  cars: assetPath(paths.cars),
}

export const sectionImageAlt: Record<SectionId, string> = {
  ai: 'Developer reviewing AI and machine learning analytics on multiple monitors',
  cybersecurity: 'Security operations center monitoring network infrastructure',
  gadgets: 'Modern smartphone, laptop, and smartwatch on a clean desk',
  software: 'Software developer working with code on a large monitor',
  space: 'Earth viewed from space with satellite in orbit',
  gaming: 'Person using a virtual reality headset in a modern setup',
  cars: 'Electric vehicle charging at a modern station with dashboard technology',
}

const BASE = 'https://images.unsplash.com'
const Q = '?w=800&q=80&fit=crop&crop=entropy&cs=tinysrgb'

/** Multiple curated fallback images per section so articles look distinct */
export const sectionImagePools: Record<SectionId, string[]> = {
  software: [
    `${BASE}/photo-1461749280684-dccba630e2f6${Q}`,
    `${BASE}/photo-1555066931-4365d14bab8c${Q}`,
    `${BASE}/photo-1517694712202-14dd9538aa97${Q}`,
    `${BASE}/photo-1542831371-29b0f74f9713${Q}`,
    `${BASE}/photo-1607705703571-c5a8695f18f6${Q}`,
    `${BASE}/photo-1516116216624-53e697fedbea${Q}`,
    `${BASE}/photo-1504384308090-c894fdcc538d${Q}`,
    `${BASE}/photo-1587620962725-abab7fe55159${Q}`,
  ],
  ai: [
    `${BASE}/photo-1677442135703-1787eea5ce01${Q}`,
    `${BASE}/photo-1620712943543-bcc4688e7485${Q}`,
    `${BASE}/photo-1655720828018-edd2daec9349${Q}`,
    `${BASE}/photo-1526374965328-7f61d4dc18c5${Q}`,
    `${BASE}/photo-1485827404703-89b55fcc595e${Q}`,
    `${BASE}/photo-1593642632559-0c6d3fc62b89${Q}`,
    `${BASE}/photo-1550751827-4bd374c3f58b${Q}`,
    `${BASE}/photo-1639762681485-074b7f938ba0${Q}`,
  ],
  cybersecurity: [
    `${BASE}/photo-1550751827-4bd374c3f58b${Q}`,
    `${BASE}/photo-1563986768494-4dee2763ff3f${Q}`,
    `${BASE}/photo-1614064641938-3bbee52942c7${Q}`,
    `${BASE}/photo-1510511459019-5dda7724fd87${Q}`,
    `${BASE}/photo-1526374965328-7f61d4dc18c5${Q}`,
    `${BASE}/photo-1600880292089-90a7e086ee0c${Q}`,
    `${BASE}/photo-1495592822108-9e6261896da8${Q}`,
    `${BASE}/photo-1504639725590-34d0984388bd${Q}`,
  ],
  gadgets: [
    `${BASE}/photo-1531297484001-80022131f5a1${Q}`,
    `${BASE}/photo-1518770660439-4636190af475${Q}`,
    `${BASE}/photo-1491933382434-500287f9b54b${Q}`,
    `${BASE}/photo-1498049794561-7780e7231661${Q}`,
    `${BASE}/photo-1601784551446-20c9e07cdbdb${Q}`,
    `${BASE}/photo-1592890288564-76628a30a657${Q}`,
    `${BASE}/photo-1544244015-0df4b3ffc6b0${Q}`,
    `${BASE}/photo-1610945415295-d9bbf067e59c${Q}`,
  ],
  space: [
    `${BASE}/photo-1462331940025-496dfbfc7564${Q}`,
    `${BASE}/photo-1446776811953-b23d57bd21aa${Q}`,
    `${BASE}/photo-1614732414444-096e5f1122d5${Q}`,
    `${BASE}/photo-1545156521-77bd85671d30${Q}`,
    `${BASE}/photo-1451187580459-43490279c0fa${Q}`,
    `${BASE}/photo-1630694093867-4b947d812bf0${Q}`,
    `${BASE}/photo-1534996858221-380b92700493${Q}`,
    `${BASE}/photo-1484589065579-248aad0d8b13${Q}`,
  ],
  gaming: [
    `${BASE}/photo-1538481199705-c710c4e965fc${Q}`,
    `${BASE}/photo-1511512578047-dfb367046420${Q}`,
    `${BASE}/photo-1493711662062-fa541adb3fc8${Q}`,
    `${BASE}/photo-1550745165-9bc0b252726f${Q}`,
    `${BASE}/photo-1612287230202-1ff1d85d1bdf${Q}`,
    `${BASE}/photo-1556438064-2d7646166914${Q}`,
    `${BASE}/photo-1509198397868-475647b2a1e5${Q}`,
    `${BASE}/photo-1580234811497-9df7fd2f357e${Q}`,
  ],
  cars: [
    `${BASE}/photo-1593941707874-efdd9bc59830${Q}`,
    `${BASE}/photo-1617788138017-80ad40651399${Q}`,
    `${BASE}/photo-1619642751034-765df036d329${Q}`,
    `${BASE}/photo-1558618666-fcd25c85cd64${Q}`,
    `${BASE}/photo-1492144534655-ae79ace964ab${Q}`,
    `${BASE}/photo-1503376780353-7ebb9c286caf${Q}`,
    `${BASE}/photo-1549317661-bd32c8ce0db2${Q}`,
    `${BASE}/photo-1619767886558-efdc259cde1a${Q}`,
  ],
}

/** Returns a unique, deterministic image for an article.
 *  Articles with their own downloaded image keep it.
 *  Articles using the generic section fallback get a distinct pool image. */
export function getArticleImage(article: Article): string {
  const fallback = sectionImages[article.section]
  if (article.image && article.image !== fallback) {
    return article.image
  }
  const pool = sectionImagePools[article.section]
  // Simple deterministic hash of the article id
  let hash = 0
  for (let i = 0; i < article.id.length; i++) {
    hash = (hash * 31 + article.id.charCodeAt(i)) >>> 0
  }
  return pool[hash % pool.length]
}
