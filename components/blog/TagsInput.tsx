"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagsInput({ tags, onChange, placeholder = "Add a tag..." }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = inputValue.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="tags-input">
      <div className="tags-list">
        {tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
            <button onClick={() => removeTag(tag)} type="button">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={placeholder}
        className="tag-input"
      />
    </div>
  );
}