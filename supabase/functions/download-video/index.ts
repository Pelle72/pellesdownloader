import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Download video function starting!")
console.log("All environment variables:", Object.keys(Deno.env.toObject()))
console.log("RAPIDAPI_KEY in env:", !!Deno.env.get('RAPIDAPI_KEY'))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, format, quality } = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }
    
    console.log('=== DEBUG INFO ===')
    console.log('URL:', url)
    console.log('Format:', format)
    console.log('Quality:', quality)
    
    // Check environment variables
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    console.log('RAPIDAPI_KEY found in env:', !!rapidApiKey)
    console.log('RAPIDAPI_KEY length:', rapidApiKey ? rapidApiKey.length : 0)
    
    if (!rapidApiKey) {
      console.error('❌ RapidAPI key not found in environment variables')
      throw new Error('RapidAPI key not configured in Supabase secrets')
    }
    
    console.log('✅ Using RapidAPI key from environment')

    console.log(`Processing ${format} download for: ${url}`)

    // Extract video ID from YouTube URL
    let videoId = ''
    let platform = 'youtube'
    
    // Check if it's a TikTok URL
    if (url.includes('tiktok.com')) {
      platform = 'tiktok'
      // For TikTok, we'll use the full URL
      videoId = url
    } else {
      // YouTube URL patterns
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
    }

    console.log('Platform:', platform)
    console.log('Video ID/URL:', videoId)

    let apiUrl, apiHost;
    
    if (platform === 'tiktok') {
      // Use dedicated TikTok API
      apiUrl = `https://tiktok-video-no-watermark2.p.rapidapi.com/` 
      apiHost = 'tiktok-video-no-watermark2.p.rapidapi.com'
    } else {
      // Use YT-API for YouTube downloads
      apiUrl = `https://yt-api.p.rapidapi.com/dl?id=${videoId}`
      apiHost = 'yt-api.p.rapidapi.com'
    }
    
    let response;
    
    if (platform === 'tiktok') {
      // TikTok API request
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': apiHost,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: videoId,
          hd: 1
        })
      })
    } else {
      // YouTube API request
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': apiHost
        }
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`${platform.toUpperCase()} API Error:`, response.status, errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log(`${platform.toUpperCase()} API Response:`, JSON.stringify(data, null, 2))

    // Handle different response formats for TikTok vs YouTube
    if (platform === 'tiktok') {
      if (!data || !data.data || !data.data.hdplay) {
        throw new Error('Invalid response from TikTok API: no download URL found')
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            downloadUrl: data.data.hdplay,
            title: data.data.title || 'TikTok Video',
            duration: data.data.duration ? `${Math.floor(data.data.duration / 60)}:${(data.data.duration % 60).toString().padStart(2, '0')}` : null,
            thumbnail: data.data.cover || null,
            format: format,
            quality: 'HD',
            fileSize: null
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      // YouTube processing (existing logic)
      if (!data || !data.formats) {
        throw new Error('Invalid response from YT-API: no formats found')
      }

      // Find the best format based on user preference
      let downloadUrl = ''
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
        
        // Sort by quality preference
        const qualityOrder = ['2160p', '1440p', '1080p', '720p', '480p', '360p', '240p']
        
        if (quality && quality !== 'best') {
          // Find specific quality
          selectedFormat = videoFormats.find((f: any) => f.qualityLabel === quality)
          if (!selectedFormat) {
            // If specific quality not found, get the closest one
            for (const q of qualityOrder) {
              selectedFormat = videoFormats.find((f: any) => f.qualityLabel === q)
              if (selectedFormat) break
            }
          }
        } else {
          // Get best available quality
          for (const q of qualityOrder) {
            selectedFormat = videoFormats.find((f: any) => f.qualityLabel === q)
            if (selectedFormat) break
          }
          // Fallback to any video format
          if (!selectedFormat) {
            selectedFormat = videoFormats[0]
          }
        }
      }

      if (!selectedFormat || !selectedFormat.url) {
        throw new Error(`No suitable ${format} format found`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            downloadUrl: selectedFormat.url,
            title: data.title || 'YouTube Video',
            duration: data.lengthSeconds ? `${Math.floor(data.lengthSeconds / 60)}:${(data.lengthSeconds % 60).toString().padStart(2, '0')}` : null,
            thumbnail: data.thumbnail?.[0]?.url || null,
            format: format,
            quality: selectedFormat.qualityLabel || selectedFormat.mimeType,
            fileSize: selectedFormat.contentLength
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

  } catch (error) {
    console.error('Error in download-video function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})