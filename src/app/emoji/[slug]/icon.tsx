import { ImageResponse } from 'next/og'
import { getEmoji } from './page'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default async function Icon({ params }: { params: { slug: string } }) {
  try {
    const emoji = await getEmoji(params.slug)
    
    // Fetch the emoji image
    const response = await fetch(emoji.image_url)
    if (!response.ok) throw new Error('Failed to fetch emoji image')
    const imageData = await response.arrayBuffer()

    // Create a Blob from the image data
    const blob = new Blob([imageData], { type: 'image/png' })
    const imageUrl = URL.createObjectURL(blob)

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
          }}
        >
          <img
            src={imageUrl}
            alt={emoji.prompt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    // Fallback icon
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            fontSize: 24,
            color: '#000',
          }}
        >
          G
        </div>
      ),
      {
        ...size,
      }
    )
  }
} 