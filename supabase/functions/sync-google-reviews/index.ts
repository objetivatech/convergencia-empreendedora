import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleReview {
  reviewId: string
  reviewer: {
    displayName: string
    profilePhotoUrl?: string
  }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting Google My Business reviews sync...')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const googleApiKey = Deno.env.get('GOOGLE_BUSINESS_API_KEY')
    const locationId = Deno.env.get('GOOGLE_BUSINESS_LOCATION_ID')

    if (!googleApiKey || !locationId) {
      throw new Error('Missing Google Business API key or location ID')
    }

    // Fetch reviews from Google My Business API
    const reviewsUrl = `https://mybusiness.googleapis.com/v4/accounts/${locationId}/locations/${locationId}/reviews?key=${googleApiKey}`
    
    console.log('Fetching reviews from Google My Business API...')
    const googleResponse = await fetch(reviewsUrl, {
      headers: {
        'Authorization': `Bearer ${googleApiKey}`,
        'Content-Type': 'application/json',
      }
    })

    if (!googleResponse.ok) {
      console.error('Google API error:', await googleResponse.text())
      throw new Error(`Google API error: ${googleResponse.status}`)
    }

    const reviewsData = await googleResponse.json()
    const reviews: GoogleReview[] = reviewsData.reviews || []

    console.log(`Found ${reviews.length} reviews from Google`)

    // Process and upsert reviews
    for (const review of reviews) {
      const rating = {
        'ONE': 1,
        'TWO': 2,
        'THREE': 3,
        'FOUR': 4,
        'FIVE': 5
      }[review.starRating] || 5

      const { error } = await supabaseClient
        .from('testimonials')
        .upsert({
          google_review_id: review.reviewId,
          author_name: review.reviewer.displayName,
          author_photo_url: review.reviewer.profilePhotoUrl,
          rating: rating,
          review_text: review.comment || '',
          review_time: new Date(review.createTime).toISOString(),
        }, {
          onConflict: 'google_review_id'
        })

      if (error) {
        console.error('Error upserting review:', error)
      } else {
        console.log(`Upserted review from ${review.reviewer.displayName}`)
      }
    }

    console.log('Google reviews sync completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        reviewsProcessed: reviews.length,
        message: 'Reviews synced successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-google-reviews function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})