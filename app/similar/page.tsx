'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ContentRecommendations from '../components/ContentRecommendations';
import { findAllSimilarContent } from '../lib/recommendations';
import type { ContentCategory, RecommendationResult } from '../lib/recommendations';

export default function SimilarContentPage() {
  const router = useRouter();
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState<Record<ContentCategory, RecommendationResult[]>>({
    book: [],
    article: [],
    video: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!summary.trim()) {
      setError('Please enter a summary to search for similar content.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const results = await findAllSimilarContent(summary);
      setRecommendations(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-4 text-2xl font-medium text-gray-900">
            Find Similar Content
          </h1>
        </div>

        {/* Search Input */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Enter Content Summary
          </label>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            placeholder="Paste the content summary here..."
            className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Find Similar Content'}
          </button>
        </div>

        {/* Recommendations */}
        <ContentRecommendations
          recommendations={recommendations}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
} 