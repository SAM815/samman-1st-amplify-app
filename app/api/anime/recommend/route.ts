import { NextRequest, NextResponse } from 'next/server'

const ANILIST_API_URL = 'https://graphql.anilist.co'

interface UserPreferences {
  favorites: Array<{
    id: number
    genres: string[]
    studios?: {
      nodes: Array<{ name: string }>
    }
  }>
  genres: string[]
  yearRange: { start: number; end: number }
  episodePreference: 'short' | 'medium' | 'long' | 'any'
  status: 'FINISHED' | 'RELEASING' | 'any'
}

const recommendationQuery = `
  query GetRecommendations(
    $genres: [String]
    $startDateGreater: FuzzyDateInt
    $startDateLesser: FuzzyDateInt
    $episodesGreater: Int
    $episodesLesser: Int
    $status: MediaStatus
    $excludeIds: [Int]
    $page: Int
  ) {
    Page(page: $page, perPage: 24) {
      media(
        type: ANIME
        genre_in: $genres
        startDate_greater: $startDateGreater
        startDate_lesser: $startDateLesser
        episodes_greater: $episodesGreater
        episodes_lesser: $episodesLesser
        status: $status
        id_not_in: $excludeIds
        sort: [SCORE_DESC, POPULARITY_DESC]
        isAdult: false
      ) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        genres
        averageScore
        episodes
        seasonYear
        status
        description(asHtml: false)
        studios(isMain: true) {
          nodes {
            name
          }
        }
      }
    }
  }
`

function getEpisodeRange(preference: string) {
  switch (preference) {
    case 'short':
      return { min: 1, max: 12 }
    case 'medium':
      return { min: 13, max: 26 }
    case 'long':
      return { min: 27, max: null }
    default:
      return { min: null, max: null }
  }
}

function extractPreferredGenres(favorites: UserPreferences['favorites']): string[] {
  const genreCount: { [genre: string]: number } = {}
  
  favorites.forEach(anime => {
    anime.genres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1
    })
  })
  
  return Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([genre]) => genre)
}

export async function POST(request: NextRequest) {
  try {
    const preferences: UserPreferences = await request.json()
    
    if (!preferences.favorites || preferences.favorites.length === 0) {
      return NextResponse.json(
        { error: 'Please select at least one favorite anime' },
        { status: 400 }
      )
    }

    // Extract genres from favorites and combine with user preferences
    const favoritesGenres = extractPreferredGenres(preferences.favorites)
    const allGenres = [...new Set([...preferences.genres, ...favoritesGenres])]
    
    // Get episode range based on preference
    const episodeRange = getEpisodeRange(preferences.episodePreference)
    
    // Exclude already selected favorites
    const excludeIds = preferences.favorites.map(anime => anime.id)
    
    // Prepare variables for GraphQL query
    const variables: any = {
      // Convert years to FuzzyDateInt format (YYYYMMDD)
      startDateGreater: preferences.yearRange.start * 10000 + 101, // e.g., 2000 -> 20000101
      startDateLesser: preferences.yearRange.end * 10000 + 1231,   // e.g., 2024 -> 20241231
      excludeIds: excludeIds.length > 0 ? excludeIds : null,
      page: 1
    }
    
    // Only add optional parameters if they have values
    if (allGenres.length > 0) {
      variables.genres = allGenres
    }
    
    if (episodeRange.min) {
      variables.episodesGreater = episodeRange.min - 1
    }
    
    if (episodeRange.max) {
      variables.episodesLesser = episodeRange.max
    }
    
    if (preferences.status !== 'any') {
      variables.status = preferences.status
    }

    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: recommendationQuery,
        variables
      }),
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error('AniList API errors:', data.errors)
      throw new Error('Failed to fetch recommendations')
    }
    
    // Check if we have any results
    if (!data.data || !data.data.Page || !data.data.Page.media) {
      console.error('No media data in response')
      return NextResponse.json({
        recommendations: []
      })
    }

    // Score recommendations based on similarity to favorites
    const recommendations = data.data.Page.media.map((anime: any) => {
      let score = anime.averageScore || 0
      
      // Boost score for matching genres
      const matchingGenres = anime.genres.filter((genre: string) => 
        allGenres.includes(genre)
      ).length
      score += matchingGenres * 5
      
      // Boost for similar studios
      const favoriteStudios = new Set(
        preferences.favorites.flatMap(fav => 
          fav.studios?.nodes.map(studio => studio.name) || []
        )
      )
      
      if (anime.studios?.nodes.some((studio: any) => favoriteStudios.has(studio.name))) {
        score += 10
      }
      
      return { ...anime, recommendationScore: score }
    })
    
    // Sort by recommendation score
    recommendations.sort((a: any, b: any) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json({
      recommendations: recommendations.slice(0, 18)
    })

  } catch (error) {
    console.error('Recommendation API error:', error)
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    )
  }
}