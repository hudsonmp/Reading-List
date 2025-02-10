'use client';

import React, { useState } from 'react';
import { Book, FileText, Youtube, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { ContentCategory, RecommendationResult } from '../lib/recommendations';

interface ContentRecommendationsProps {
  recommendations: Record<ContentCategory, RecommendationResult[]>;
  isLoading: boolean;
}

export default function ContentRecommendations({
  recommendations,
  isLoading
}: ContentRecommendationsProps) {
  const [expandedCategory, setExpandedCategory] = useState<ContentCategory | null>('book');

  const getIcon = (category: ContentCategory) => {
    switch (category) {
      case 'book':
        return <Book className="w-5 h-5" />;
      case 'video':
        return <Youtube className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryTitle = (category: ContentCategory) => {
    switch (category) {
      case 'book':
        return 'Similar Books';
      case 'video':
        return 'Related Videos';
      case 'article':
        return 'Related Articles';
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
      {(['book', 'article', 'video'] as ContentCategory[]).map(category => (
        <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedCategory(
              expandedCategory === category ? null : category
            )}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-500">
                {getIcon(category)}
              </div>
              <h3 className="font-medium text-gray-900">
                {getCategoryTitle(category)}
                <span className="ml-2 text-sm text-gray-500">
                  ({recommendations[category]?.length || 0})
                </span>
              </h3>
            </div>
            {expandedCategory === category ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedCategory === category && recommendations[category]?.length > 0 && (
            <div className="border-t border-gray-100">
              {recommendations[category].map((result, index) => (
                <div
                  key={index}
                  className="px-6 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex gap-4">
                    {result.thumbnailUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={result.thumbnailUrl}
                          alt={result.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <a
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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
              ))}
            </div>
          )}

          {expandedCategory === category && recommendations[category]?.length === 0 && (
            <div className="px-6 py-4 text-center text-gray-500 border-t border-gray-100">
              No {category}s found matching your content.
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 