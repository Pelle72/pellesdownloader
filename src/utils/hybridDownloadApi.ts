import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Store the client instance
let supabaseClient: SupabaseClient | null = null

// Function to initialize Supabase client when ready
const initializeSupabase = (): SupabaseClient | null => {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

  console.log('🔍 Supabase Environment Check:', {
    'URL exists': !!supabaseUrl,
    'URL value': supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    'Key exists': !!supabaseAnonKey,
    'Key length': supabaseAnonKey ? supabaseAnonKey.length : 0,
    'Environment': import.meta.env.MODE
  })

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.trim() && supabaseAnonKey.trim()) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
      console.log('✅ Supabase client initialized successfully')
      console.log('🔗 Supabase URL:', supabaseUrl.substring(0, 30) + '...')
      return supabaseClient
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error)
      return null
    }
  } else {
    console.log('❌ Supabase environment variables not available:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    })
  }

  return null
}

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

export const downloadVideo = async (url: string, format: 'video' | 'audio', apiKey?: string, quality?: string): Promise<DownloadResult> => {
  try {
    // Try to initialize Supabase client
    const supabase = initializeSupabase()
    
    if (supabase) {
      console.log('🚀 Using Supabase edge function for download')
      
      const { data, error } = await supabase.functions.invoke('download-video', {
        body: { url, format, quality }
      })

      if (error) {
        console.error('Supabase function error:', error)
        // Fall back to direct API call if Supabase fails
        if (apiKey) {
          console.log('📱 Falling back to direct API call')
          return await directApiCall(url, format, apiKey)
        }
        return {
          success: false,
          error: 'Backend service unavailable. Please provide your API key.'
        }
      }

      return data
    } else {
      // Supabase not available, use direct API call
      if (!apiKey) {
        return {
          success: false,
          error: 'Backend not configured. Please enter your RapidAPI key.'
        }
      }
      
      console.log('📱 Using direct API call (Supabase not ready)')
      return await directApiCall(url, format, apiKey)
    }

  } catch (error) {
    console.error('Download API error:', error)
    
    // Fall back to direct API call if available
    if (apiKey) {
      console.log('📱 Falling back to direct API call due to error')
      return await directApiCall(url, format, apiKey)
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred'
    }
  }
}

// Direct API call function (same as before)
const directApiCall = async (url: string, format: 'video' | 'audio', apiKey: string): Promise<DownloadResult> => {
  console.log('🔄 Making direct API call for:', url)
  
  // Check if it's a TikTok URL
  if (url.toLowerCase().includes('tiktok')) {
    console.log('🎵 Detected TikTok URL - using TikTok API')
    
    const response = await fetch('https://tiktok-video-no-watermark2.p.rapidapi.com/', {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'tiktok-video-no-watermark2.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        hd: 1
      })
    })

    if (!response.ok) {
      throw new Error(`TikTok API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data || !data.data || !data.data.hdplay) {
      throw new Error('Invalid response from TikTok API: no download URL found')
    }

    return {
      success: true,
      data: {
        downloadUrl: data.data.hdplay,
        title: data.data.title || 'TikTok Video',
        duration: data.data.duration ? `${Math.floor(data.data.duration / 60)}:${(data.data.duration % 60).toString().padStart(2, '0')}` : undefined,
        thumbnail: data.data.cover || undefined,
        format: format
      }
    }
  }

  // YouTube processing - Extract video ID from YouTube URL (including Shorts)
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
      break
    }
  }

  if (!videoId) {
    throw new Error('Invalid URL. Could not extract video ID from YouTube URL.')
  }

  // Call YT-API directly
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
    throw new Error(`API request failed: ${response.status}`)
  }

  const data = await response.json()

  if (!data || !data.formats) {
    throw new Error('Invalid response from YT-API: no formats found')
  }

  // Find the best format
  let selectedFormat = null

  if (format === 'audio') {
    const audioFormats = data.formats.filter((f: any) => 
      f.mimeType && f.mimeType.includes('audio') && f.url
    )
    selectedFormat = audioFormats.find((f: any) => f.mimeType.includes('mp4')) || audioFormats[0]
  } else {
    const videoFormats = data.formats.filter((f: any) => 
      f.mimeType && f.mimeType.includes('video') && f.url
    )
    selectedFormat = videoFormats.find((f: any) => f.qualityLabel === '720p') || 
                   videoFormats.find((f: any) => f.qualityLabel === '480p') || 
                   videoFormats.find((f: any) => f.qualityLabel === '360p') ||
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

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return !!initializeSupabase()
}