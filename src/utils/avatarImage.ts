const MAX_BYTES = 180_000
const MAX_DIM = 256

/** Resize and compress an uploaded image for localStorage-safe avatar storage. */
export async function compressAvatarFile(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, or WebP).')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image must be under 8 MB.')
  }

  const dataUrl = await readFileAsDataUrl(file)
  const img = await loadImage(dataUrl)

  const canvas = document.createElement('canvas')
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process image.')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  let quality = 0.88
  let result = canvas.toDataURL('image/jpeg', quality)
  while (result.length > MAX_BYTES && quality > 0.4) {
    quality -= 0.08
    result = canvas.toDataURL('image/jpeg', quality)
  }

  if (result.length > MAX_BYTES) {
    throw new Error('Image is too large after compression. Try a smaller photo.')
  }

  return result
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image.'))
    img.src = src
  })
}
