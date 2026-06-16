import { assetPath } from '../utils/assetPath'

export type AvatarMode = 'glyph' | 'male' | 'female' | 'upload'

export const DEFAULT_AVATARS = {
  male: assetPath('images/avatars/avatar-male.png'),
  female: assetPath('images/avatars/avatar-female.png'),
} as const
