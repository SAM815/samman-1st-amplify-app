'use client'

import React, { useState } from 'react'

interface SearchFilterProps {
  onSearch: (searchTerm: string) => void
  onFilter: (filters: { genre?: string; sort?: string }) => void
  genres: readonly string[]
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch, onFilter, genres }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedGenre(value)
    onFilter({ genre: value, sort: sortBy })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSortBy(value)
    onFilter({ genre: selectedGenre, sort: value })
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search anime..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600 placeholder-gray-400"
        />
        
        <select
          value={selectedGenre}
          onChange={handleGenreChange}
          className="px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
        >
          <option value="all">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre.toLowerCase()}>
              {genre}
            </option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-600"
        >
          <option value="rating">Sort by Rating</option>
          <option value="episodes">Sort by Episodes</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>
    </div>
  )
}

export default SearchFilter