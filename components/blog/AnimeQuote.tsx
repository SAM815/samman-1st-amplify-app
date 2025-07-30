'use client';

import React, { useState, useEffect } from 'react';

interface Quote {
  content: string;
  anime: string;
  character: string;
}

// Fallback quotes for when API limit is reached
const fallbackQuotes: Quote[] = [
  {
    content: "People's lives don't end when they die. It ends when they lose faith.",
    anime: "Naruto",
    character: "Itachi Uchiha"
  },
  {
    content: "If you don't take risks, you can't create a future!",
    anime: "One Piece",
    character: "Monkey D. Luffy"
  },
  {
    content: "The world isn't perfect. But it's there for us, doing the best it can....that's what makes it so damn beautiful.",
    anime: "Fullmetal Alchemist",
    character: "Roy Mustang"
  },
  {
    content: "Being weak is nothing to be ashamed of... Staying weak is!",
    anime: "Fairy Tail",
    character: "Fuegoleon Vermillion"
  },
  {
    content: "A person grows up when he's able to overcome hardships. Protection is important, but there are some things that a person must learn on his own.",
    anime: "Attack on Titan",
    character: "Levi Ackerman"
  }
];

export default function AnimeQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  };

  const fetchQuote = async () => {
    setLoading(true);
    setError(null);
    
    // If already using fallback, just get another random quote
    if (usingFallback) {
      setQuote(getRandomFallbackQuote());
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('https://api.animechan.io/v1/quotes/random');
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. The free API allows only 5 requests per hour.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setQuote(data);
      setUsingFallback(false);
    } catch (err) {
      console.error('Error fetching quote:', err);
      // Use fallback quotes when API fails
      setQuote(getRandomFallbackQuote());
      setUsingFallback(true);
      if (err instanceof Error && err.message.includes('Rate limit')) {
        setError('API rate limit reached. Showing offline quotes instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="anime-quote-container">
      <h2 className="text-2xl font-bold mb-4 text-center">Anime Quote of the Moment</h2>
      
      {loading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-2">Loading anime wisdom...</p>
        </div>
      )}
      
      {error && usingFallback && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {quote && !loading && (
        <div className="quote-card bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white">
          <blockquote className="text-lg md:text-xl italic mb-4">
            "{quote.content}"
          </blockquote>
          <div className="text-right">
            <p className="font-semibold">— {quote.character}</p>
            <p className="text-sm opacity-90">{quote.anime}</p>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={fetchQuote}
              className="bg-white text-purple-600 px-4 py-2 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105"
            >
              Get New Quote
            </button>
            {usingFallback && (
              <span className="text-xs opacity-75">📌 Offline Mode</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}