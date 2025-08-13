'use client'

import React, { useState } from 'react'
import { Search, Filter, Loader2, Heart, Star, Calendar, ChevronDown } from 'lucide-react'

interface AnimeData {
  id: number
  title: {
    romaji: string
    english?: string
    native?: string
  }
  coverImage: {
    large: string
    medium: string
  }
  genres: string[]
  averageScore: number
  episodes?: number
  seasonYear?: number
  status: string
  description?: string
  studios?: {
    nodes: Array<{ name: string }>
  }
}

interface UserPreferences {
  favorites: AnimeData[]
  genres: string[]
  yearRange: { start: number; end: number }
  episodePreference: 'short' | 'medium' | 'long' | 'any'
  status: 'FINISHED' | 'RELEASING' | 'any'
}

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
]

const AnimeRecommendations = () => {
  const [step, setStep] = useState<'search' | 'preferences' | 'results'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AnimeData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favorites: [],
    genres: [],
    yearRange: { start: 2000, end: new Date().getFullYear() },
    episodePreference: 'any',
    status: 'any'
  })
  const [recommendations, setRecommendations] = useState<AnimeData[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const searchAnime = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch('/api/anime/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      })
      
      if (!response.ok) throw new Error('Search failed')
      
      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const toggleFavorite = (anime: AnimeData) => {
    setUserPreferences(prev => ({
      ...prev,
      favorites: prev.favorites.some(fav => fav.id === anime.id)
        ? prev.favorites.filter(fav => fav.id !== anime.id)
        : [...prev.favorites, anime]
    }))
  }

  const toggleGenre = (genre: string) => {
    setUserPreferences(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const getRecommendations = async () => {
    if (userPreferences.favorites.length === 0) {
      alert('Please select at least one favorite anime to get recommendations')
      return
    }

    setIsLoadingRecommendations(true)
    try {
      const response = await fetch('/api/anime/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreferences)
      })
      
      if (!response.ok) throw new Error('Failed to get recommendations')
      
      const data = await response.json()
      setRecommendations(data.recommendations)
      setStep('results')
    } catch (error) {
      console.error('Recommendation error:', error)
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const episodeRangeText = (pref: string) => {
    switch(pref) {
      case 'short': return '1-12 episodes'
      case 'medium': return '13-26 episodes'
      case 'long': return '27+ episodes'
      default: return 'Any length'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Anime Recommendations
        </h1>

        {step === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Step 1: Select Your Favorite Anime
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Search and select anime you've enjoyed to help us understand your preferences
              </p>
              
              <div className="relative mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAnime()}
                  placeholder="Search for anime..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={searchAnime}
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50"
                >
                  {isSearching ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                </button>
              </div>

              {userPreferences.favorites.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Selected Favorites ({userPreferences.favorites.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userPreferences.favorites.map(anime => (
                      <span
                        key={anime.id}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm flex items-center gap-2"
                      >
                        {anime.title.english || anime.title.romaji}
                        <button
                          onClick={() => toggleFavorite(anime)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(anime => {
                  const isFavorite = userPreferences.favorites.some(fav => fav.id === anime.id)
                  return (
                    <div
                      key={anime.id}
                      className={`relative border rounded-lg overflow-hidden transition-all cursor-pointer ${
                        isFavorite 
                          ? 'border-purple-500 ring-2 ring-purple-500' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                      onClick={() => toggleFavorite(anime)}
                    >
                      <img
                        src={anime.coverImage.medium}
                        alt={anime.title.english || anime.title.romaji}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3">
                        <h4 className="font-medium text-sm mb-1 line-clamp-1 text-gray-800 dark:text-gray-200">
                          {anime.title.english || anime.title.romaji}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          {anime.averageScore && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {anime.averageScore}%
                            </span>
                          )}
                          {anime.episodes && (
                            <span>{anime.episodes} eps</span>
                          )}
                        </div>
                      </div>
                      {isFavorite && (
                        <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full">
                          <Heart className="w-4 h-4 fill-current" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {userPreferences.favorites.length > 0 && (
                <button
                  onClick={() => setStep('preferences')}
                  className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Continue to Preferences
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'preferences' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                Step 2: Set Your Preferences
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Preferred Genres
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {GENRE_OPTIONS.map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.genres.includes(genre)
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Year Range
                  </h3>
                  <div className="flex gap-4 items-center">
                    <input
                      type="number"
                      min="1960"
                      max={new Date().getFullYear()}
                      value={userPreferences.yearRange.start}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        yearRange: { ...prev.yearRange, start: parseInt(e.target.value) }
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <span className="text-gray-600 dark:text-gray-400">to</span>
                    <input
                      type="number"
                      min="1960"
                      max={new Date().getFullYear()}
                      value={userPreferences.yearRange.end}
                      onChange={(e) => setUserPreferences(prev => ({
                        ...prev,
                        yearRange: { ...prev.yearRange, end: parseInt(e.target.value) }
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Episode Length Preference
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['short', 'medium', 'long', 'any'].map(pref => (
                      <button
                        key={pref}
                        onClick={() => setUserPreferences(prev => ({ 
                          ...prev, 
                          episodePreference: pref as any 
                        }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.episodePreference === pref
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {episodeRangeText(pref)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    Airing Status
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'FINISHED', label: 'Completed' },
                      { value: 'RELEASING', label: 'Currently Airing' },
                      { value: 'any', label: 'Any' }
                    ].map(status => (
                      <button
                        key={status.value}
                        onClick={() => setUserPreferences(prev => ({ 
                          ...prev, 
                          status: status.value as any 
                        }))}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userPreferences.status === status.value
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setStep('search')}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={getRecommendations}
                  disabled={isLoadingRecommendations}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoadingRecommendations ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Recommendations...
                    </>
                  ) : (
                    'Get Recommendations'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  Your Recommendations
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white">
                      <option>Sort by Score</option>
                      <option>Sort by Popularity</option>
                      <option>Sort by Year</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white">
                      <option>All Genres</option>
                      {GENRE_OPTIONS.map(genre => (
                        <option key={genre}>{genre}</option>
                      ))}
                    </select>
                    <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>Currently Airing</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map(anime => (
                  <div
                    key={anime.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    <img
                      src={anime.coverImage.large}
                      alt={anime.title.english || anime.title.romaji}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                        {anime.title.english || anime.title.romaji}
                      </h3>
                      
                      <div className="flex items-center gap-3 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {anime.averageScore && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            {anime.averageScore}%
                          </span>
                        )}
                        {anime.episodes && (
                          <span>{anime.episodes} episodes</span>
                        )}
                        {anime.seasonYear && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {anime.seasonYear}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {anime.genres.slice(0, 3).map(genre => (
                          <span
                            key={genre}
                            className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                        {anime.genres.length > 3 && (
                          <span className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">
                            +{anime.genres.length - 3} more
                          </span>
                        )}
                      </div>

                      {anime.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {anime.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setStep('search')
                  setRecommendations([])
                  setUserPreferences({
                    favorites: [],
                    genres: [],
                    yearRange: { start: 2000, end: new Date().getFullYear() },
                    episodePreference: 'any',
                    status: 'any'
                  })
                }}
                className="mt-8 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Start New Recommendation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimeRecommendations