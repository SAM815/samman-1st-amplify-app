'use client'

import { useState, useEffect } from 'react'
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react'

interface AnimeQuote {
  anime: string
  character: string
  quote: string
}

// Fallback quotes in case API fails
const fallbackQuotes: AnimeQuote[] = [
  {
    anime: "Naruto",
    character: "Naruto Uzumaki",
    quote: "I'm not gonna run away, I never go back on my word! That's my nindo: my ninja way!"
  },
  {
    anime: "One Piece",
    character: "Monkey D. Luffy",
    quote: "If you don't take risks, you can't create a future!"
  },
  {
    anime: "Attack on Titan",
    character: "Eren Yeager",
    quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win!"
  },
  {
    anime: "Death Note",
    character: "L",
    quote: "Sometimes, the questions are complicated, and the answers are simple."
  },
  {
    anime: "My Hero Academia",
    character: "All Might",
    quote: "It's fine now. Why? Because I am here!"
  },
  {
    anime: "Demon Slayer",
    character: "Tanjiro Kamado",
    quote: "The strong should aid and protect the weak. Then, the weak will become strong and they, in turn, will aid and protect those weaker than them."
  },
  {
    anime: "Fullmetal Alchemist",
    character: "Edward Elric",
    quote: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something."
  },
  {
    anime: "Steins;Gate",
    character: "Okabe Rintarou",
    quote: "No one knows what the future holds. That's why its potential is infinite."
  },
  {
    anime: "Hunter x Hunter",
    character: "Gon Freecss",
    quote: "Being able to cry for his companion. I was thinking you couldn't cry, nor did you have a heart. But in that case why... even a little... don't you share that feeling... with all the people you kill?"
  },
  {
    anime: "Code Geass",
    character: "Lelouch vi Britannia",
    quote: "The only ones who should kill are those who are prepared to be killed."
  }
]

export default function AnimeQuotes() {
  const [quotes, setQuotes] = useState<AnimeQuote[]>([])
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch quotes from API
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        // Using AnimeChan API - free anime quotes API
        const response = await fetch('https://animechan.xyz/api/quotes')
        if (!response.ok) throw new Error('Failed to fetch')
        
        const data = await response.json()
        const formattedQuotes = data.map((item: any) => ({
          anime: item.anime,
          character: item.character,
          quote: item.quote
        }))
        
        setQuotes(formattedQuotes)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch quotes:', err)
        // Use fallback quotes if API fails
        setQuotes(fallbackQuotes)
        setError(true)
        setLoading(false)
      }
    }

    fetchQuotes()
  }, [])

  // Rotate quotes every 10 seconds
  useEffect(() => {
    if (quotes.length === 0) return

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [quotes.length])

  const handleManualRotate = () => {
    setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8 shadow-xl">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-white/20 rounded w-1/2 mb-2"></div>
          <div className="h-6 bg-white/20 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  const currentQuote = quotes[currentQuoteIndex] || fallbackQuotes[0]

  return (
    <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-2xl p-8 shadow-xl relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <QuoteIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Daily Anime Wisdom</h2>
              <p className="text-purple-200 text-sm">
                {error ? 'Showing cached quotes' : 'Fresh quotes from your favorite anime'}
              </p>
            </div>
          </div>
          <button
            onClick={handleManualRotate}
            className="p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors group"
            aria-label="Next quote"
          >
            <RefreshCw className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        <div className="space-y-4">
          <blockquote className="text-xl md:text-2xl font-medium text-white leading-relaxed">
            "{currentQuote.quote}"
          </blockquote>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 font-semibold">— {currentQuote.character}</p>
              <p className="text-purple-300 text-sm">{currentQuote.anime}</p>
            </div>
            
            {/* Progress dots */}
            <div className="flex space-x-2">
              {quotes.slice(0, 5).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentQuoteIndex % 5
                      ? 'bg-white'
                      : 'bg-white/30'
                  }`}
                />
              ))}
              {quotes.length > 5 && (
                <span className="text-white/50 text-xs">+{quotes.length - 5}</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}