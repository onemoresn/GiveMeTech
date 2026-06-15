declare global {
  interface Window {
    SiteCommandTrack?: (type: string, data?: Record<string, unknown>) => void
  }
}

export function trackSiteCommandEvent(
  type: string,
  data?: Record<string, unknown>,
) {
  window.SiteCommandTrack?.(type, data)
}
