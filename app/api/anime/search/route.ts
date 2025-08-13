import { NextRequest, NextResponse } from 'next/server'

const ANILIST_API_URL = 'https://graphql.anilist.co'

const searchQuery = `
  query SearchAnime($search: String!) {
    Page(page: 1, perPage: 12) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
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

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        variables: { search: query }
      }),
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors) {
      console.error('AniList API errors:', data.errors)
      throw new Error('Failed to fetch anime data')
    }

    return NextResponse.json({
      results: data.data.Page.media || []
    })

  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Failed to search anime' },
      { status: 500 }
    )
  }
}