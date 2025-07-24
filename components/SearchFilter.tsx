"use client";

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilterProps {
  onSearch: (query: string) => void;
  onTagFilter: (tags: string[]) => void;
  onRatingFilter: (minRating: number | null) => void;
  availableTags: string[];
}

export default function SearchFilter({ onSearch, onTagFilter, onRatingFilter, availableTags }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onTagFilter(newTags);
  };

  const handleRatingChange = (rating: number | null) => {
    setMinRating(rating);
    onRatingFilter(rating);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setMinRating(null);
    onSearch('');
    onTagFilter([]);
    onRatingFilter(null);
  };

  const hasActiveFilters = searchQuery || selectedTags.length > 0 || minRating !== null;

  return (
    <div className="search-filter">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search anime reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="submit" className="search-button">Search</button>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`filter-toggle ${showFilters ? 'active' : ''}`}
        >
          <Filter size={20} />
          Filters
          {hasActiveFilters && <span className="filter-badge" />}
        </button>
      </form>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="filter-panel"
          >
            <div className="filter-section">
              <h4>Tags</h4>
              <div className="tag-filters">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Minimum Rating</h4>
              <div className="rating-filters">
                {[null, 7, 8, 9].map(rating => (
                  <button
                    key={rating ?? 'all'}
                    onClick={() => handleRatingChange(rating)}
                    className={`rating-filter ${minRating === rating ? 'active' : ''}`}
                  >
                    {rating ? `${rating}+ ⭐` : 'All'}
                  </button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="clear-filters">
                <X size={16} /> Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}