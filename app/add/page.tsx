'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Book, Globe, FileText, Bookmark, ArrowLeft } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useReadingList } from '@/hooks/useReadingList';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function AddPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useReadingList();
  const [formData, setFormData] = React.useState({
    title: '',
    url: '',
    type: 'book',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addItem(formData);
    if (result) {
      router.push('/list');
    }
  };

  const typeIcons = {
    book: <Book className="w-6 h-6" />,
    website: <Globe className="w-6 h-6" />,
    article: <FileText className="w-6 h-6" />,
    report: <Bookmark className="w-6 h-6" />
  };

  if (!session) {
    router.push('/profile');
    return <LoadingSpinner />;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="ml-4 text-2xl font-medium text-gray-900">Add to Reading List</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Type
            </label>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.entries(typeIcons).map(([type, icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                    formData.type === type
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`${formData.type === type ? 'text-blue-500' : 'text-gray-500'}`}>
                    {icon}
                  </div>
                  <span className={`mt-2 text-sm capitalize ${
                    formData.type === type ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add to List
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 