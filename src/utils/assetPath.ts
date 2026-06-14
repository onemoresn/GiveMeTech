/** Resolve public asset paths for GitHub Pages subpath deployment */
export function assetPath(path: string): string {
  const normalized = path.replace(/^\//, '')
  const base = import.meta.env.BASE_URL
  return `${base}${normalized}`
}
