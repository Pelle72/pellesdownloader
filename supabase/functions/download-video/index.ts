import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Download video function starting!")
console.log("Available environment variables:", Object.keys(Deno.env.toObject()))

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, format } = await req.json()
    
    if (!url) {
      throw new Error('URL is required')
    }
    
    console.log('=== DEBUG INFO ===')
    console.log('URL:', url)
    console.log('Format:', format)
    
    // Check environment variables
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    console.log('RAPIDAPI_KEY found:', !!rapidApiKey)
    
    // Also try alternative environment variable names that might be used
    const rapidApiKey2 = Deno.env.get('RAPID_API_KEY')
    const rapidApiKey3 = Deno.env.get('rapidapi_key')
    console.log('Checking alternative names:')
    console.log('RAPID_API_KEY found:', !!rapidApiKey2) 
    console.log('rapidapi_key found:', !!rapidApiKey3)
    
    if (!rapidApiKey && !rapidApiKey2 && !rapidApiKey3) {
      console.error('❌ RapidAPI key not found in any format')
      throw new Error('RapidAPI key not configured in Supabase secrets')
    }
    
    const finalKey = rapidApiKey || rapidApiKey2 || rapidApiKey3

    console.log(`Processing ${format} download for: ${url}`)

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

    console.log('Extracted video ID:', videoId)

    // Use YT-API for YouTube downloads
    const apiUrl = `https://yt-api.p.rapidapi.com/dl?id=${videoId}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': finalKey,
        'X-RapidAPI-Host': 'yt-api.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YT-API Error:', response.status, errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('YT-API Response:', JSON.stringify(data, null, 2))

    if (!data || !data.formats) {
      throw new Error('Invalid response from YT-API: no formats found')
    }

    // Find the best format based on user preference
    let downloadUrl = ''
    let selectedFormat = null

    if (format === 'audio') {
      // Look for audio-only formats (usually have no video)
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