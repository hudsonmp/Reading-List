import React from 'react';
import { ReadingItem } from '../app/lib/firebase-service';
import { Book, Globe, FileText, Bookmark, Youtube, Clock, Tag, Brain, ExternalLink } from 'lucide-react';

interface ReadingItemDetailProps {
  item: ReadingItem;
  onClose: () => void;
}

export function ReadingItemDetail({ item, onClose }: ReadingItemDetailProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'report': return <Bookmark className="w-5 h-5" />;
      case 'video': return <Youtube className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-gray-500">
                {getIcon(item.type)}
              </div>
              <h2 className="text-xl font-medium text-gray-900">{item.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* URL */}
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Visit {item.type === 'video' ? 'Video' : 'Content'}
            </a>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          )}

          {/* Summary */}
          {item.summary && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-600">{item.summary}</p>
            </div>
          )}

          {/* AI Analysis */}
          {item.aiAnalysis && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">AI Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty & Time */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Brain className="w-4 h-4" />
                    <span>Difficulty: {item.aiAnalysis.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Time to consume: {item.aiAnalysis.timeToConsume}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Tag className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.aiAnalysis.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Key Points</h4>
                <ul className="list-disc list-inside space-y-1">
                  {item.aiAnalysis.keyPoints.map((point, index) => (
                    <li key={index} className="text-gray-600">{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Suggested Readings */}
          {item.suggestedReadings && item.suggestedReadings.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Suggested Readings</h3>
              <div className="space-y-3">
                {item.suggestedReadings.map((suggestion, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                    {suggestion.url && (
                      <a
                        href={suggestion.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm mt-1 block"
                      >
                        Visit Link
                      </a>
                    )}
                    <p className="text-gray-600 text-sm mt-2">{suggestion.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Videos */}
          {item.relatedVideos && item.relatedVideos.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Related Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.relatedVideos.map((video, index) => (
                  <a
                    key={index}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                  >
                    {video.thumbnail && (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900">{video.title}</h4>
                      <p className="text-gray-600 text-sm mt-1">{video.platform}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* User Notes */}
          {item.notes && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Your Notes</h3>
              <p className="text-gray-600">{item.notes}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            Last analyzed: {new Date(item.aiAnalysis?.lastAnalyzed || '').toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
} 