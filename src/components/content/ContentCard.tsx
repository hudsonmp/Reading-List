'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { analyzeContent } from '@/services/claudeService';
import { findRelatedContent } from '@/services/googleSearchService';
import { useAuth } from '@/components/auth/AuthContext';

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
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'analyzing' | 'searching'>('idle');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showXPAnimation, setShowXPAnimation] = useState(false);

  const handleStatusChange = async (newStatus: ContentCardProps['content']['status']) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'items', content.id), {
        status: newStatus,
      });

      if (newStatus === 'completed') {
        // Get current user stats
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const currentStats = userData.stats || {
            totalItems: 0,
            completedItems: 0,
            streak: 0,
            level: 1,
            xp: 0,
          };

          // Calculate XP based on content type and complexity
          let xpGain = 50; // Base XP
          if (content.analysis) {
            xpGain += content.analysis.complexity * 10; // More XP for complex content
          }
          if (content.type === 'academic') xpGain *= 1.5; // Bonus for academic papers
          if (content.type === 'book') xpGain *= 1.3; // Bonus for books

          const newXP = currentStats.xp + xpGain;
          const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;

          // Update user stats
          await updateDoc(userRef, {
            stats: {
              ...currentStats,
              completedItems: currentStats.completedItems + 1,
              level: newLevel,
              xp: newXP,
            }
          });

          // Show XP animation
          setShowXPAnimation(true);
          setTimeout(() => setShowXPAnimation(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      setAnalysisStep('analyzing');
      
      // First, analyze the content using Claude
      const analysis = await analyzeContent(content.url);
      if (!analysis) {
        throw new Error('Failed to analyze content');
      }
      
      setAnalysisStep('searching');
      // Then, find related content based on the content type
      const relatedContent = await findRelatedContent(
        analysis.keywords.join(' '),
        content.type
      );

      // Update the document with analysis results
      await updateDoc(doc(db, 'items', content.id), {
        analysis,
        relatedContent,
        lastAnalyzed: new Date().toISOString(),
      });
      
      setShowResults(true);
    } catch (error) {
      console.error('Error analyzing content:', error);
      setAnalysisError(
        error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while analyzing the content. Please try again.'
      );
      // Reset the analysis step on error
      setAnalysisStep('idle');
    } finally {
      setIsAnalyzing(false);
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
      className="bg-white rounded-lg shadow-lg p-6 relative"
    >
      {showXPAnimation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: -20 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          +XP
        </motion.div>
      )}
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
        <div className="mt-4">
          <button
            onClick={() => setShowResults(!showResults)}
            className="w-full btn-secondary mb-4 flex items-center justify-center gap-2"
          >
            <span role="img" aria-label="AI">🤖</span>
            {showResults ? 'Hide AI Analysis' : 'Show AI Analysis'}
          </button>
          
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <p className="text-gray-700 mb-4">{content.analysis.summary}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Reading Time</span>
                  <p className="font-medium">{content.analysis.readingTime} minutes</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Complexity</span>
                  <p className="font-medium">{content.analysis.complexity}/10</p>
                </div>
              </div>
              
              <div className="mb-4">
                <h5 className="font-semibold text-sm text-gray-700 mb-2">Key Takeaways</h5>
                <ul className="list-disc list-inside space-y-1">
                  {content.analysis.takeaways.map((takeaway, index) => (
                    <li key={index} className="text-gray-600 text-sm">{takeaway}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="font-semibold text-sm text-gray-700 mb-2">Keywords</h5>
                <div className="flex flex-wrap gap-2">
                  {content.analysis.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {analysisError && (
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4">
              {analysisError}
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full btn-secondary flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-600"></div>
                {analysisStep === 'analyzing' ? 'Analyzing with AI...' : 'Finding related content...'}
              </>
            ) : (
              <>
                <span role="img" aria-label="AI">🤖</span>
                Analyze with AI
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}; 