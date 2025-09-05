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

    // Extract video ID from YouTube URL (including Shorts)
    let videoId = ''
    const patterns = [
      // Regular YouTube URLs
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      // YouTube Shorts URLs
      /youtube\.com\/shorts\/([^&\n?#]+)/,
      /m\.youtube\.com\/shorts\/([^&\n?#]+)/,
      // Mobile URLs
      /m\.youtube\.com\/watch\?v=([^&\n?#]+)/
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        videoId = match[1]
        console.log('Video ID extracted:', videoId, 'from pattern:', pattern.source)
        break
      }
    }

    if (!videoId) {
      console.error('Failed to extract video ID from URL:', url)
      throw new Error('Invalid YouTube URL. Could not extract video ID.')
    }

    console.log('Processing URL:', url)
    console.log('Extracted video ID:', videoId)
    console.log('Format requested:', format)

    // Call YT-API directly from frontend
    const apiUrl = `https://yt-api.p.rapidapi.com/dl?id=${videoId}`
    console.log('API URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'yt-api.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YT-API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        videoId: videoId,
        originalUrl: url,
        errorResponse: errorText
      })
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('YT-API Response for video ID:', videoId)
    console.log('Response data:', JSON.stringify(data, null, 2))

    if (!data) {
      throw new Error('Empty response from YT-API')
    }

    if (!data.formats) {
      console.error('No formats in response:', data)
      throw new Error('Invalid response from YT-API: no formats found')
    }

    // Find the best format based on user preference
    let selectedFormat = null

    console.log('Available formats:', data.formats.length)
    console.log('Format types available:', data.formats.map((f: any) => ({
      mimeType: f.mimeType,
      hasAudio: f.hasAudio,
      hasVideo: f.hasVideo,
      qualityLabel: f.qualityLabel
    })))

    if (format === 'audio') {
      // Look for audio-only formats
      const audioFormats = data.formats.filter((f: any) => 
        f.mimeType && f.mimeType.includes('audio') && f.url
      )
      console.log('Audio formats found:', audioFormats.length)
      selectedFormat = audioFormats.find((f: any) => f.mimeType.includes('mp4')) || audioFormats[0]
    } else {
      // Look for video formats with audio
      const videoFormats = data.formats.filter((f: any) => 
        f.mimeType && f.mimeType.includes('video') && f.url
      )
      console.log('Video formats found:', videoFormats.length)
      
      // For Shorts, try any available video format since quality options might be limited
      selectedFormat = videoFormats.find((f: any) => f.qualityLabel === '720p') || 
                     videoFormats.find((f: any) => f.qualityLabel === '480p') || 
                     videoFormats.find((f: any) => f.qualityLabel === '360p') ||
                     videoFormats[0] // Take any available format for Shorts
    }

    console.log('Selected format:', selectedFormat)

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