'use client'

import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('./RichTextEditor'),
  { 
    ssr: false,
    loading: () => <div className="bg-gray-700 rounded-lg h-64 animate-pulse"></div>
  }
)

export default RichTextEditor