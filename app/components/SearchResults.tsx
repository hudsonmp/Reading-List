'use client';

import React, { useState } from 'react';
import { Book, FileText, Youtube, ExternalLink } from 'lucide-react';
import type { SearchResult } from '../lib/search-service';
import AddToListButton from './AddToListButton';
import { toast } from 'react-hot-toast';

interface SearchResultsProps {
  results: SearchResult[];
  onRefine: (filters: SearchFilters) => void;
  isLoading: boolean;
}

interface SearchFilters {
  types: ('book' | 'article' | 'video')[];
  minRelevance: number;
  sortBy: 'relevance' | 'date';
}

export default function SearchResults({ results, onRefine, isLoading }: SearchResultsProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    types: ['book', 'article', 'video'],
    minRelevance: 0,
    sortBy: 'relevance'
  });

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onRefine(updatedFilters);
  };

  const getIcon = (type: 'book' | 'article' | 'video') => {
    switch (type) {
      case 'book':
        return <Book className="w-5 h-5" />;
      case 'video':
        return <Youtube className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <h3 className="font-medium text-gray-900">Refine Results</h3>
        
        <div className="flex flex-wrap gap-4">
          {/* Content Type Filters */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Content Type</label>
            <div className="flex gap-2">
              {(['book', 'article', 'video'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    const types = filters.types.includes(type)
                      ? filters.types.filter(t => t !== type)
                      : [...filters.types, type];
                    handleFilterChange({ types });
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filters.types.includes(type)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Relevance Filter */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Minimum Relevance</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={filters.minRelevance}
              onChange={e => handleFilterChange({ minRelevance: Number(e.target.value) })}
              className="w-48"
            />
            <span className="text-sm text-gray-600 ml-2">{filters.minRelevance}</span>
          </div>

          {/* Sort Options */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange({ sortBy: e.target.value as 'relevance' | 'date' })}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No results found. Try adjusting your filters.
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-500">{getIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {result.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <AddToListButton
                        item={{
                          title: result.title,
                          link: result.link,
                          type: result.type,
                          source: result.source,
                          snippet: result.snippet,
                        }}
                        onSuccess={() => toast.success('Added to your reading list')}
                        onError={() => toast.error('Failed to add to reading list')}
                      />
                      <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {result.snippet}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-gray-500">{result.source}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-blue-600">
                      Relevance: {result.relevanceScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 