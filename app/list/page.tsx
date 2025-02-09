'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Globe, FileText, Bookmark, ArrowLeft, Search, Trash2, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useReadingList } from '@/hooks/useReadingList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function ListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, loading, toggleComplete, deleteItem } = useReadingList();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const getIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book className="w-5 h-5" />;
      case 'website': return <Globe className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'report': return <Bookmark className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const filteredItems = items.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900">Please sign in</h2>
          <p className="mt-2 text-gray-500">Sign in to view your reading list</p>
          <button
            onClick={() => router.push('/profile')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="ml-4 text-2xl font-medium text-gray-900">Reading List</h1>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Types</option>
                <option value="book">Books</option>
                <option value="website">Websites</option>
                <option value="article">Articles</option>
                <option value="report">Reports</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No items in your reading list yet.</p>
                <button
                  onClick={() => router.push('/add')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                  Add your first item
                </button>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
                    item.completed ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => item.id && toggleComplete(item.id, item.completed)}
                        className={`mt-1 p-1 rounded-full border transition-colors ${
                          item.completed
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-gray-500">{getIcon(item.type)}</div>
                          <h3 className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.title}
                          </h3>
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-1 block"
                          >
                            {item.url}
                          </a>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Added {new Date(item.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => item.id && deleteItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
} 