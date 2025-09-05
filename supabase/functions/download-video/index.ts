import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

console.log("Download video function up and running!")

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

    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    if (!rapidApiKey) {
      throw new Error('RapidAPI key not configured')
    }

    console.log(`Processing ${format} download for: ${url}`)

    // Determine the appropriate RapidAPI endpoint based on URL
    let apiEndpoint = ''
    let headers = {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': '',
      'Content-Type': 'application/json'
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      // YouTube download endpoint
      apiEndpoint = 'https://youtube-mp36.p.rapidapi.com/dl'
      headers['X-RapidAPI-Host'] = 'youtube-mp36.p.rapidapi.com'
    } else if (url.includes('tiktok.com')) {
      // TikTok download endpoint  
      apiEndpoint = 'https://tiktok-video-no-watermark2.p.rapidapi.com/'
      headers['X-RapidAPI-Host'] = 'tiktok-video-no-watermark2.p.rapidapi.com'
    } else {
      throw new Error('Unsupported platform. Only YouTube and TikTok are supported.')
    }

    // Make request to RapidAPI
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        link: url,
        format: format === 'audio' ? 'mp3' : 'mp4'
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('RapidAPI Error:', errorData)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          downloadUrl: data.link || data.play || data.download_url,
          title: data.title || 'Downloaded Video',
          duration: data.duration,
          thumbnail: data.thumbnail,
          format: format
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