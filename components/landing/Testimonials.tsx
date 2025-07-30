'use client'

import React from 'react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Anime Blogger',
    content: 'This platform has completely transformed how I share my anime reviews. The community engagement is incredible, and the tools make it so easy to create beautiful content.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 5
  },
  {
    name: 'Marcus Johnson',
    role: 'Content Creator',
    content: 'The best place to discover new anime and connect with fellow fans. I\'ve found so many hidden gems through the recommendation system!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5
  },
  {
    name: 'Yuki Tanaka',
    role: 'Anime Enthusiast',
    content: 'Finally, a platform that understands what anime fans really want. The tracking features help me manage my watchlist perfectly.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5
  }
]

const Testimonials = () => {
  return (
    <section className="py-20 lg:py-32 bg-gray-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-4">
            <span className="text-purple-300 text-sm font-medium">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Loved by Anime Fans Worldwide
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Join thousands of satisfied users who have made our platform their home for anime content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote icon */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative">
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-300 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 ring-2 ring-purple-500/20"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 bg-gray-900/50 backdrop-blur-sm rounded-full px-8 py-4 border border-gray-700">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/40?img=${i}`}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-gray-900"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Join 10,000+ anime fans</p>
              <p className="text-gray-400 text-sm">Active community members</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials