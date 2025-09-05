import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create client with fallback to avoid startup errors
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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
      return {
        success: false,
        error: 'Supabase not configured. Please check your environment variables.'
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