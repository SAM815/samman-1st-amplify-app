'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, getCurrentUser } from 'aws-amplify/auth'
import { APP_NAME } from '@/lib/utils/constants'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const user = await getCurrentUser()
      setUserName(user.username)
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/home" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-purple-400">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href
                    ? 'text-purple-400 font-medium'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-gray-300 text-sm">{userName || 'User'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 transition-colors ${
                    pathname === link.href
                      ? 'text-purple-400 font-medium'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-gray-300 text-sm">{userName || 'User'}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors w-full"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar