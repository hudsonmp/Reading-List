'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';
import { ContentCard } from '@/components/content/ContentCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ReadingItem {
  id: string;
  title: string;
  url: string;
  type: 'book' | 'video' | 'article' | 'academic';
  tags: string[];
  status: 'unread' | 'in-progress' | 'completed';
  dateAdded: string;
  userId: string;
  analysis?: {
    summary: string;
    keywords: string[];
    readingTime: number;
    complexity: number;
    takeaways: string[];
  };
}

export const ReadingList: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [filter, setFilter] = useState<ReadingItem['status']>('unread');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // If user is logged in, get their items
        if (user) {
          const q = query(
            collection(db, 'items'),
            where('userId', '==', user.uid),
            where('status', '==', filter),
            orderBy('dateAdded', 'desc')
          );

          unsubscribe = onSnapshot(q, (snapshot) => {
            try {
              const newItems = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as ReadingItem[];

              setItems(newItems);
              setLoading(false);
            } catch (err) {
              console.error('Error processing items:', err);
              setError('Error loading items. Please try again.');
              setLoading(false);
            }
          }, (err) => {
            console.error('Error fetching items:', err);
            setError('Error loading items. Please try again.');
            setLoading(false);
          });
        } else {
          // If no user is logged in, show empty list
          setItems([]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchItems:', err);
        setError('Error loading items. Please try again.');
        setLoading(false);
      }
    };

    fetchItems();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, filter]); // Re-run when user or filter changes

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Reading List</h2>
        <div className="flex gap-2">
          {(['unread', 'in-progress', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center py-12"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-6"
          >
            {items.length > 0 ? (
              items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ContentCard content={item} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                {user ? (
                  <div className="text-gray-500">
                    <p className="mb-2">No items in your {filter} list</p>
                    <p className="text-sm">Add some content to get started!</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p className="mb-2">Sign in to view your reading list</p>
                    <p className="text-sm">Your items will be saved and synced across devices</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 