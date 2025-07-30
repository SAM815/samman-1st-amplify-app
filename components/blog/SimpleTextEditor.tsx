'use client'

import { useState, useEffect } from 'react'

interface SimpleTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export default function SimpleTextEditor({ content, onChange, placeholder = "Write your anime review..." }: SimpleTextEditorProps) {
  const [text, setText] = useState(content)

  useEffect(() => {
    setText(content)
  }, [content])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-700">
      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-600">
        <span className="text-gray-400 text-sm">Rich text editor temporarily replaced with simple editor</span>
      </div>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full min-h-[300px] p-4 bg-gray-700 text-gray-100 placeholder-gray-400 resize-none focus:outline-none"
      />
    </div>
  )
}