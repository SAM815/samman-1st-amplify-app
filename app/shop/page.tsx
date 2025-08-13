'use client'

import React, { useState, useMemo } from 'react'
import { ShoppingCart, X, Search, MessageCircle, ThumbsUp, SlidersHorizontal, Send } from 'lucide-react'
import Image from 'next/image'

// Product data type
interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  anime: string
  type: string
  likes: number
  comments: Comment[]
}

interface Comment {
  id: string
  user: string
  text: string
  timestamp: Date
}

// Mock comments data
const generateMockComments = (count: number): Comment[] => {
  const users = ['NarutoFan123', 'AnimeLover', 'OtakuKing', 'MangaReader', 'CosplayQueen']
  const comments = [
    'Amazing quality! Totally worth it!',
    'Looks exactly like in the picture',
    'Fast shipping and great material',
    'My favorite purchase this year!',
    'Highly recommended for all fans',
    'The detail is incredible',
    'Perfect fit and comfortable',
    'Got so many compliments wearing this!'
  ]
  
  return Array.from({ length: count }, (_, i) => ({
    id: `comment-${i}`,
    user: users[Math.floor(Math.random() * users.length)],
    text: comments[Math.floor(Math.random() * comments.length)],
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
  }))
}

// Mock product data based on available images
const products: Product[] = [
  // Attack on Titan Products
  { id: '1', name: 'AOT Survey Corps Cloak', price: 89.99, image: '/assets/AOT_cloak.jpg', category: 'Outerwear', anime: 'Attack on Titan', type: 'Cloak', likes: 234, comments: generateMockComments(12) },
  { id: '2', name: 'AOT Green Hoodie', price: 59.99, image: '/assets/AOT_green_hoodie.jpg', category: 'Hoodies', anime: 'Attack on Titan', type: 'Hoodie', likes: 189, comments: generateMockComments(8) },
  { id: '3', name: 'AOT Scout Regiment Hoodie', price: 64.99, image: '/assets/AOT_hoodie.jpg', category: 'Hoodies', anime: 'Attack on Titan', type: 'Hoodie', likes: 276, comments: generateMockComments(15) },
  
  // Naruto Products
  { id: '4', name: 'Akatsuki Cloud Bracelet', price: 19.99, image: '/assets/akatsuki_bracelet.jpeg', category: 'Accessories', anime: 'Naruto', type: 'Bracelet', likes: 98, comments: generateMockComments(5) },
  { id: '5', name: 'Akatsuki Hoodie Red Cloud', price: 69.99, image: '/assets/akatsuki_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 412, comments: generateMockComments(23) },
  { id: '6', name: 'Akatsuki Black Hoodie V1', price: 74.99, image: '/assets/akatsuki_hoodie_black_1.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 389, comments: generateMockComments(19) },
  { id: '7', name: 'Akatsuki Black Hoodie V2', price: 74.99, image: '/assets/akatsuki_hoodie_black_2.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 356, comments: generateMockComments(17) },
  { id: '8', name: 'Naruto Bulk Hoodie Set', price: 149.99, image: '/assets/bulk_naruto_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Bundle', likes: 267, comments: generateMockComments(11) },
  { id: '9', name: 'Classic Naruto Orange Hoodie', price: 54.99, image: '/assets/classic_naruto_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 534, comments: generateMockComments(28) },
  { id: '10', name: 'Jiraiya Sage Hoodie', price: 64.99, image: '/assets/jiraiya_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 298, comments: generateMockComments(14) },
  { id: '11', name: 'Jonin Vest Hoodie', price: 79.99, image: '/assets/jonin_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 445, comments: generateMockComments(21) },
  { id: '12', name: 'Naruto Sage Cloak Bundle', price: 199.99, image: '/assets/naruto_cloak_bulk.jpg', category: 'Outerwear', anime: 'Naruto', type: 'Bundle', likes: 156, comments: generateMockComments(7) },
  { id: '13', name: 'Hokage Robe Hoodie', price: 84.99, image: '/assets/naruto_hokage_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 623, comments: generateMockComments(35) },
  { id: '14', name: 'Hokage Merchandise Set', price: 124.99, image: '/assets/naruto_hokage_merch.jpg', category: 'Bundles', anime: 'Naruto', type: 'Bundle', likes: 201, comments: generateMockComments(9) },
  { id: '15', name: 'Naruto Classic Hoodie', price: 49.99, image: '/assets/naruto_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 467, comments: generateMockComments(24) },
  { id: '16', name: 'Naruto Action Figure', price: 34.99, image: '/assets/naruto_toy.jpeg', category: 'Figures', anime: 'Naruto', type: 'Figure', likes: 312, comments: generateMockComments(18) },
  { id: '17', name: 'ANBU Seal Hoodie', price: 69.99, image: '/assets/seal_hoodie_black_white.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 378, comments: generateMockComments(20) },
  { id: '18', name: 'Uchiha Clan Hoodie Black', price: 71.99, image: '/assets/uchiha_hoodie_black_1.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 512, comments: generateMockComments(26) },
  { id: '19', name: 'Uchiha Symbol Hoodie B&W', price: 67.99, image: '/assets/uchiha_hoodie_black_white.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 423, comments: generateMockComments(22) },
  { id: '20', name: 'Madara Uchiha Hoodie', price: 79.99, image: '/assets/uchiha_madara_hoodie.jpg', category: 'Hoodies', anime: 'Naruto', type: 'Hoodie', likes: 389, comments: generateMockComments(18) },
  
  // My Hero Academia Products
  { id: '21', name: 'Bakugo Dog Plush', price: 29.99, image: '/assets/dog_bakugo.jpeg', category: 'Plushies', anime: 'My Hero Academia', type: 'Plush', likes: 456, comments: generateMockComments(23) },
  { id: '22', name: 'Hawks Pro Hero Figure', price: 44.99, image: '/assets/hawks_toy.jpeg', category: 'Figures', anime: 'My Hero Academia', type: 'Figure', likes: 334, comments: generateMockComments(16) },
  
  // Jujutsu Kaisen Products
  { id: '23', name: 'Gojo Satoru Hoodie', price: 74.99, image: '/assets/gojo_hoodie.jpg', category: 'Hoodies', anime: 'Jujutsu Kaisen', type: 'Hoodie', likes: 892, comments: generateMockComments(42) },
  { id: '24', name: 'Gojo Infinity Keychain', price: 14.99, image: '/assets/gojo_key_chain.jpeg', category: 'Accessories', anime: 'Jujutsu Kaisen', type: 'Keychain', likes: 167, comments: generateMockComments(7) },
  { id: '25', name: 'Gojo & Geto Duo Figure', price: 89.99, image: '/assets/gojo_suguru_toy.jpeg', category: 'Figures', anime: 'Jujutsu Kaisen', type: 'Figure', likes: 523, comments: generateMockComments(25) },
  { id: '26', name: 'Gojo Satoru Figure', price: 54.99, image: '/assets/gojo_toy.jpeg', category: 'Figures', anime: 'Jujutsu Kaisen', type: 'Figure', likes: 678, comments: generateMockComments(32) },
  { id: '27', name: 'Inumaki Toge Figure', price: 39.99, image: '/assets/inumaki_toy.jpeg', category: 'Figures', anime: 'Jujutsu Kaisen', type: 'Figure', likes: 289, comments: generateMockComments(13) },
  { id: '28', name: 'Yuji & Megumi Duo Figure', price: 79.99, image: '/assets/itadori_megumi_toy.jpeg', category: 'Figures', anime: 'Jujutsu Kaisen', type: 'Figure', likes: 445, comments: generateMockComments(22) },
  
  // Haikyuu Products
  { id: '29', name: 'Karasuno Team Hoodie', price: 62.99, image: '/assets/haikyuu hoodie.jpeg', category: 'Hoodies', anime: 'Haikyuu', type: 'Hoodie', likes: 356, comments: generateMockComments(18) },
  { id: '30', name: 'Haikyuu Volleyball Team Figures', price: 94.99, image: '/assets/haikyuu_toys.jpeg', category: 'Figures', anime: 'Haikyuu', type: 'Figure Set', likes: 412, comments: generateMockComments(20) },
  
  // One Piece Products
  { id: '31', name: 'Straw Hat Pirates Bag', price: 39.99, image: '/assets/one_piece_bag.jpeg', category: 'Accessories', anime: 'One Piece', type: 'Bag', likes: 567, comments: generateMockComments(27) },
  { id: '32', name: 'One Piece Grand Line Hoodie', price: 68.99, image: '/assets/one_piece_hoodie.jpeg', category: 'Hoodies', anime: 'One Piece', type: 'Hoodie', likes: 723, comments: generateMockComments(36) },
  { id: '33', name: 'Luffy Wanted Poster Shirt', price: 34.99, image: '/assets/one_piece_shirt.jpeg', category: 'Shirts', anime: 'One Piece', type: 'T-Shirt', likes: 891, comments: generateMockComments(41) },
  { id: '34', name: 'Trafalgar Law Jeans Hoodie', price: 82.99, image: '/assets/law_jeans_hoodie.jpeg', category: 'Hoodies', anime: 'One Piece', type: 'Hoodie', likes: 456, comments: generateMockComments(23) },
  { id: '35', name: 'Roronoa Zoro Hoodie', price: 71.99, image: '/assets/zoro_hoodie.jpeg', category: 'Hoodies', anime: 'One Piece', type: 'Hoodie', likes: 634, comments: generateMockComments(30) },
  
  // Combo Products
  { id: '36', name: 'Anime Hoodie & Shirt Combo', price: 89.99, image: '/assets/hoodie_shirt_combo.jpeg', category: 'Bundles', anime: 'Mixed', type: 'Bundle', likes: 234, comments: generateMockComments(12) },
]

// Filter state interface
interface FilterState {
  searchQuery: string
  category: string[]
  anime: string[]
  priceRange: [number, number]
  sortBy: string
}

const ShopPage = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: [],
    anime: [],
    priceRange: [0, 200],
    sortBy: 'featured'
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set())
  const [cart, setCart] = useState<{ [key: string]: number }>({})
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newComment, setNewComment] = useState('')
  const [productComments, setProductComments] = useState<{ [key: string]: Comment[] }>({})

  // Initialize product comments
  useState(() => {
    const initialComments: { [key: string]: Comment[] } = {}
    products.forEach(product => {
      initialComments[product.id] = product.comments
    })
    setProductComments(initialComments)
  })

  // Get unique values for filters
  const categories = [...new Set(products.map(p => p.category))].sort()
  const animeList = [...new Set(products.map(p => p.anime))].sort()

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesSearch = 
          product.name.toLowerCase().includes(query) ||
          product.anime.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.type.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }
      
      // Category filter
      if (filters.category.length > 0 && !filters.category.includes(product.category)) {
        return false
      }
      
      // Anime filter
      if (filters.anime.length > 0 && !filters.anime.includes(product.anime)) {
        return false
      }
      
      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }
      
      return true
    })

    // Sort products
    switch (filters.sortBy) {
      case 'priceLow':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'priceHigh':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      default:
        // Featured/default sorting
        filtered.sort((a, b) => b.likes - a.likes)
    }

    return filtered
  }, [filters])

  const toggleFilter = (type: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type as 'category' | 'anime'].includes(value)
        ? (prev[type as 'category' | 'anime'] as string[]).filter(v => v !== value)
        : [...(prev[type as 'category' | 'anime'] as string[]), value]
    }))
  }

  const handleLike = (productId: string) => {
    setLikedProducts(prev => {
      const newLikes = new Set(prev)
      if (newLikes.has(productId)) {
        newLikes.delete(productId)
      } else {
        newLikes.add(productId)
      }
      return newLikes
    })
  }

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      category: [],
      anime: [],
      priceRange: [0, 200],
      sortBy: 'featured'
    })
  }

  const openCommentModal = (product: Product) => {
    setSelectedProduct(product)
    setShowCommentModal(true)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedProduct) return

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      user: 'Current User',
      text: newComment,
      timestamp: new Date()
    }

    setProductComments(prev => ({
      ...prev,
      [selectedProduct.id]: [comment, ...(prev[selectedProduct.id] || [])]
    }))

    setNewComment('')
  }

  const formatDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }

  const activeFilterCount = filters.category.length + filters.anime.length + 
    (filters.searchQuery ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 200 ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, anime, or categories..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white text-purple-600 text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <option value="featured">Featured</option>
                <option value="popular">Most Popular</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>

              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300 cursor-pointer" />
                {Object.keys(cart).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(cart).reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowFilters(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700"
                >
                  Clear all filters
                </button>
              )}
            </div>

            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Category</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => toggleFilter('category', category)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category.includes(category)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anime Filter */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Anime Series</h3>
                <div className="space-y-2">
                  {animeList.map(anime => (
                    <label key={anime} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.anime.includes(anime)}
                        onChange={() => toggleFilter('anime', anime)}
                        className="mr-3 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{anime}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Price Range</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                    }))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    min="0"
                    max="200"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50" 
            onClick={() => setShowCommentModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[80vh] rounded-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Comments for {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4">
              {productComments[selectedProduct.id]?.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4">
                  {productComments[selectedProduct.id]?.map(comment => (
                    <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {comment.user}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {comment.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Comment */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="container mx-auto px-4 py-4">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 pb-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {product.anime}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${product.price}
                    </span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="px-4 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Social Actions */}
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                    <button
                      onClick={() => handleLike(product.id)}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <ThumbsUp 
                        className={`w-4 h-4 ${likedProducts.has(product.id) ? 'fill-current text-purple-600 dark:text-purple-400' : ''}`} 
                      />
                      <span className="text-sm">{product.likes}</span>
                    </button>
                    <button 
                      onClick={() => openCommentModal(product)}
                      className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{productComments[product.id]?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShopPage