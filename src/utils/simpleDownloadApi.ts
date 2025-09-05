export interface DownloadResult {
  success: boolean
  data?: {
    downloadUrl: string
    title: string
    duration?: string
    thumbnail?: string
    format: string
  }
  error?: string
}

export const downloadVideo = async (url: string, format: 'video' | 'audio', apiKey?: string): Promise<DownloadResult> => {
  try {
    // For now, let's use a direct approach without Supabase
    // This requires the user to input their API key directly
    
    if (!apiKey) {
      return {
        success: false,
        error: 'RapidAPI key is required. Please enter your API key.'
      }
    }

    // Extract video ID from YouTube URL
    let videoId = ''
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        videoId = match[1]
        break
      }
    }

    if (!videoId) {
      throw new Error('Invalid YouTube URL. Could not extract video ID.')
    }

    console.log('Extracting video ID:', videoId)

    // Call YT-API directly from frontend
    const apiUrl = `https://yt-api.p.rapidapi.com/dl?id=${videoId}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'yt-api.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YT-API Error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    console.log('YT-API Response received')

    if (!data || !data.formats) {
      throw new Error('Invalid response from YT-API: no formats found')
    }

    // Find the best format based on user preference
    let selectedFormat = null

    if (format === 'audio') {
      // Look for audio-only formats
      const audioFormats = data.formats.filter((f: any) => 
        f.mimeType && f.mimeType.includes('audio') && f.url
      )
      selectedFormat = audioFormats.find((f: any) => f.mimeType.includes('mp4')) || audioFormats[0]
    } else {
      // Look for video formats with audio
      const videoFormats = data.formats.filter((f: any) => 
        f.mimeType && f.mimeType.includes('video') && f.url && f.hasAudio
      )
      selectedFormat = videoFormats.find((f: any) => f.qualityLabel === '720p') || 
                     videoFormats.find((f: any) => f.qualityLabel === '480p') || 
                     videoFormats[0]
    }

    if (!selectedFormat || !selectedFormat.url) {
      throw new Error(`No suitable ${format} format found`)
    }

    return {
      success: true,
      data: {
        downloadUrl: selectedFormat.url,
        title: data.title || 'YouTube Video',
        duration: data.lengthSeconds ? `${Math.floor(data.lengthSeconds / 60)}:${(data.lengthSeconds % 60).toString().padStart(2, '0')}` : undefined,
        thumbnail: data.thumbnail?.[0]?.url,
        format: format
      }
    }

  } catch (error) {
    console.error('Download API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}

export const triggerDownload = (url: string, filename: string) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}