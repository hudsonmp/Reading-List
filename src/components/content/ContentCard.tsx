'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { analyzeContent } from '@/services/claudeService';
import { findRelatedContent } from '@/services/googleSearchService';

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    url: string;
    type: 'book' | 'video' | 'article' | 'academic';
    tags: string[];
    status: 'unread' | 'in-progress' | 'completed';
    dateAdded: string;
    analysis?: {
      summary: string;
      keywords: string[];
      readingTime: number;
      complexity: number;
      takeaways: string[];
    };
  };
}

export const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const handleStatusChange = async (newStatus: ContentCardProps['content']['status']) => {
    try {
      await updateDoc(doc(db, 'items', content.id), {
        status: newStatus,
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAnalyze = async () => {
    try {
      const analysis = await analyzeContent(content.url);
      const relatedContent = await findRelatedContent(analysis.keywords.join(' '));

      await updateDoc(doc(db, 'items', content.id), {
        analysis,
        relatedContent,
      });
    } catch (error) {
      console.error('Error analyzing content:', error);
    }
  };

  const getStatusColor = (status: ContentCardProps['content']['status']) => {
    switch (status) {
      case 'unread':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: ContentCardProps['content']['type']) => {
    switch (type) {
      case 'book':
        return '📚';
      case 'video':
        return '🎥';
      case 'article':
        return '📰';
      case 'academic':
        return '🎓';
      default:
        return '📄';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl" role="img" aria-label={content.type}>
              {getTypeIcon(content.type)}
            </span>
            <h3 className="text-xl font-bold">{content.title}</h3>
          </div>
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 mb-4 block"
          >
            {content.url}
          </a>
          <div className="flex flex-wrap gap-2 mb-4">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(content.status)}`}>
            {content.status}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="btn-secondary text-sm"
              disabled={content.status === 'in-progress'}
            >
              Start Reading
            </button>
            <button
              onClick={() => handleStatusChange('completed')}
              className="btn-primary text-sm"
              disabled={content.status === 'completed'}
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>

      {content.analysis ? (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Analysis</h4>
          <p className="text-gray-700 mb-2">{content.analysis.summary}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Reading Time</span>
              <p className="font-medium">{content.analysis.readingTime} minutes</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Complexity</span>
              <p className="font-medium">{content.analysis.complexity}/10</p>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleAnalyze}
          className="mt-4 w-full btn-secondary"
        >
          Analyze Content
        </button>
      )}
    </motion.div>
  );
}; 