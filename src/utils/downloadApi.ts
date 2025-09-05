import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key exists:', !!supabaseAnonKey)

// Only create client if both values exist and are not empty
const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.trim() && supabaseAnonKey.trim()) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

console.log('Supabase client created:', !!supabase)

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

export const downloadVideo = async (url: string, format: 'video' | 'audio'): Promise<DownloadResult> => {
  try {
    if (!supabase) {
      // Temporary demo mode while Supabase is being configured
      console.log('Running in demo mode - Supabase not configured yet')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        data: {
          downloadUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          title: `Demo ${format === 'audio' ? 'Audio' : 'Video'} - ${url.split('/').pop()}`,
          duration: '2:30',
          thumbnail: 'https://via.placeholder.com/320x180/8b5cf6/ffffff?text=Demo+Video',
          format: format
        }
      }
    }

    const { data, error } = await supabase.functions.invoke('download-video', {
      body: { url, format }
    })

    if (error) {
      console.error('Supabase function error:', error)
      return {
        success: false,
        error: error.message || 'Failed to process video'
      }
    }

    return data
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