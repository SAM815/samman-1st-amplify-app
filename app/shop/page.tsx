'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from 'aws-amplify/auth'
import Navbar from '@/components/layout/Navbar'
import { ShoppingBag, Package, Tag, TrendingUp } from 'lucide-react'

export default function ShopPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

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
        <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="w-10 h-10 text-purple-500" />
          Shop
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Package className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Merchandise</h3>
            <p className="text-gray-400 text-sm">Official anime merchandise coming soon</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <Tag className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Collectibles</h3>
            <p className="text-gray-400 text-sm">Rare figures and limited editions</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Trending</h3>
            <p className="text-gray-400 text-sm">Popular items from the community</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Shop Coming Soon</h3>
            <p className="text-gray-400">
              We're working on bringing you the best anime merchandise and collectibles. Stay tuned for our grand opening!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}