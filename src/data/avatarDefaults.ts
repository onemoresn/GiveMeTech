import { assetPath } from '../utils/assetPath'

export type AvatarMode =
  | 'glyph'
  | 'upload'
  | 'male'
  | 'female'
  | 'maleBlack'
  | 'femaleBlack'
  | 'maleAsian'
  | 'femaleAsian'

export type AvatarPresetMode = Exclude<AvatarMode, 'glyph' | 'upload'>

export const DEFAULT_AVATARS: Record<AvatarPresetMode, string> = {
  male: assetPath('images/avatars/avatar-male.png'),
  female: assetPath('images/avatars/avatar-female.png'),
  maleBlack: assetPath('images/avatars/avatar-male-black.png'),
  femaleBlack: assetPath('images/avatars/avatar-female-black.png'),
  maleAsian: assetPath('images/avatars/avatar-male-asian.png'),
  femaleAsian: assetPath('images/avatars/avatar-female-asian.png'),
}

export const AVATAR_PRESET_MODES: AvatarPresetMode[] = [
  'male',
  'female',
  'maleBlack',
  'femaleBlack',
  'maleAsian',
  'femaleAsian',
]

export const AVATAR_PRESET_LABELS: Record<AvatarPresetMode, string> = {
  male: 'Male cartoon avatar',
  female: 'Female cartoon avatar',
  maleBlack: 'African American male cartoon avatar',
  femaleBlack: 'African American female cartoon avatar',
  maleAsian: 'Asian Filipino male cartoon avatar',
  femaleAsian: 'Asian Filipino female cartoon avatar',
}

export function isAvatarPresetMode(mode: AvatarMode): mode is AvatarPresetMode {
  return mode in DEFAULT_AVATARS
}
