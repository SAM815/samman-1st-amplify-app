'use client'

import React from 'react'
import Hero from './Hero'
import Features from './Features'
import Testimonials from './Testimonials'
import CTA from './CTA'
import Footer from './Footer'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  )
}

export default LandingPage