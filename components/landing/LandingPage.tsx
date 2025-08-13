'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import Hero from './Hero'
import Features from './Features'
import Testimonials from './Testimonials'
import CTA from './CTA'
import Footer from './Footer'

const LandingPage = () => {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Floating Theme Toggle */}
      <div className="fixed top-8 right-8 z-50">
        <div 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="group relative cursor-pointer"
        >
          {/* Animated background circle */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"></div>
          
          {/* Main toggle container */}
          <div className="relative bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
            <div className="relative w-8 h-8">
              {/* Sun icon */}
              <Sun className={`absolute inset-0 w-8 h-8 text-yellow-500 transform transition-all duration-500 ${
                theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
              }`} />
              
              {/* Moon icon */}
              <Moon className={`absolute inset-0 w-8 h-8 text-purple-600 dark:text-purple-400 transform transition-all duration-500 ${
                theme === 'dark' ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
              }`} />
            </div>
          </div>
          
          {/* Tooltip */}
          <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap">
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </div>
          </div>
        </div>
      </div>

      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}

export default LandingPage