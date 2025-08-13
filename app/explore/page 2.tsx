'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
import SearchFilter from '@/components/common/SearchFilter'
import { AnimeItem } from '@/types'
import { GENRES } from '@/lib/utils/constants'

const allAnimeData: AnimeItem[] = [
  {
    id: 1,
    title: "Attack on Titan",
    genre: "Action, Dark Fantasy",
    episodes: 87,
    rating: 9.1,
    image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
    description: "Humanity fights for survival against giant humanoid Titans."
  },
  {
    id: 2,
    title: "Death Note",
    genre: "Psychological Thriller",
    episodes: 37,
    rating: 9.0,
    image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg",
    description: "A high school student discovers a supernatural notebook."
  },
  {
    id: 3,
    title: "One Piece",
    genre: "Adventure, Comedy",
    episodes: 1000,
    rating: 8.9,
    image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
    description: "Pirates search for the ultimate treasure, One Piece."
  },
  {
    id: 4,
    title: "Demon Slayer",
    genre: "Action, Historical",
    episodes: 46,
    rating: 8.7,
    image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
    description: "A young boy becomes a demon slayer to save his sister."
  },
  {
    id: 5,
    title: "My Hero Academia",
    genre: "Superhero, School",
    episodes: 138,
    rating: 8.5,
    image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg",
    description: "In a world of superpowers, a boy dreams of becoming a hero."
  },
  {
    id: 6,
    title: "Steins;Gate",
    genre: "Sci-Fi, Thriller",
    episodes: 24,
    rating: 9.2,
    image: "https://cdn.myanimelist.net/images/anime/5/73199.jpg",
    description: "Time travel experiments lead to unexpected consequences."
  },
  {
    id: 7,
    title: "Fullmetal Alchemist: Brotherhood",
    genre: "Action, Fantasy",
    episodes: 64,
    rating: 9.5,
    image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg",
    description: "Two brothers search for the Philosopher's Stone."
  },
  {
    id: 8,
    title: "Cowboy Bebop",
    genre: "Space Western, Drama",
    episodes: 26,
    rating: 8.8,
    image: "https://cdn.myanimelist.net/images/anime/4/19644.jpg",
    description: "Bounty hunters travel through space in 2071."
  }
]

export default function ExplorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [animeData, setAnimeData] = useState<AnimeItem[]>(allAnimeData)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      await getCurrentUser()
      setLoading(false)
    } catch (error) {
      router.push('/login')
    }
  }

  const handleSearch = (searchTerm: string) => {
    const filtered = allAnimeData.filter(anime =>
      anime.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anime.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setAnimeData(filtered)
  }

  const handleFilter = (filters: { genre?: string; sort?: string }) => {
    let filtered = [...allAnimeData]

    if (filters.genre && filters.genre !== 'all') {
      filtered = filtered.filter(anime =>
        anime.genre.toLowerCase().includes(filters.genre!.toLowerCase())
      )
    }

    if (filters.sort) {
      filtered.sort((a, b) => {
        switch (filters.sort) {
          case 'rating':
            return b.rating - a.rating
          case 'episodes':
            return b.episodes - a.episodes
          case 'title':
            return a.title.localeCompare(b.title)
          default:
            return 0
        }
      })
    }

    setAnimeData(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">Explore Anime</h1>
        
        <SearchFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          genres={GENRES}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {animeData.map((anime) => (
            <div key={anime.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105">
              <div className="relative h-48">
                <img 
                  src={anime.image} 
                  alt={anime.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm">
                  ★ {anime.rating}
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold text-white mb-1">{anime.title}</h2>
                <p className="text-purple-400 text-sm mb-2">{anime.genre}</p>
                <p className="text-gray-400 text-sm">{anime.episodes} Episodes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}