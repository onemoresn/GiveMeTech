import type { SectionId } from './sections'
import { assetPath } from '../utils/assetPath'

const paths: Record<SectionId, string> = {
  ai: 'images/topics/topic-ai-ml.png',
  cybersecurity: 'images/topics/topic-cybersecurity.png',
  gadgets: 'images/topics/topic-gadgets.png',
  software: 'images/topics/topic-software.png',
  space: 'images/topics/topic-space.png',
  gaming: 'images/topics/topic-gaming.png',
}

export const sectionImages: Record<SectionId, string> = {
  ai: assetPath(paths.ai),
  cybersecurity: assetPath(paths.cybersecurity),
  gadgets: assetPath(paths.gadgets),
  software: assetPath(paths.software),
  space: assetPath(paths.space),
  gaming: assetPath(paths.gaming),
}

export const sectionImageAlt: Record<SectionId, string> = {
  ai: 'Developer reviewing AI and machine learning analytics on multiple monitors',
  cybersecurity: 'Security operations center monitoring network infrastructure',
  gadgets: 'Modern smartphone, laptop, and smartwatch on a clean desk',
  software: 'Software developer working with code on a large monitor',
  space: 'Earth viewed from space with satellite in orbit',
  gaming: 'Person using a virtual reality headset in a modern setup',
}
