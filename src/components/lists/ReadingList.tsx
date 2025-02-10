'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'items'),
      where('userId', '==', user.uid),
      where('status', '==', filter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ReadingItem[];

      setItems(newItems);
    });

    return () => unsubscribe();
  }, [user, filter]);

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

      <AnimatePresence>
        <motion.div
          layout
          className="grid gap-6"
        >
          {items.map((item) => (
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
          ))}
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              No items in your {filter} list
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}; 