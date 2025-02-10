'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/auth/AuthContext';

interface UserStats {
  totalItems: number;
  completedItems: number;
  streak: number;
  level: number;
  xp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

const achievements: Achievement[] = [
  {
    id: 'first-complete',
    title: 'First Completion',
    description: 'Complete your first reading item',
    icon: '🎯',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day reading streak',
    icon: '🔥',
  },
  {
    id: 'diverse-5',
    title: 'Content Explorer',
    description: 'Read 5 different types of content',
    icon: '🌎',
  },
  {
    id: 'analysis-10',
    title: 'Deep Thinker',
    description: 'Analyze 10 pieces of content',
    icon: '🧠',
  },
  {
    id: 'collection-50',
    title: 'Knowledge Collector',
    description: 'Add 50 items to your reading list',
    icon: '📚',
  },
];

export const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalItems: 0,
    completedItems: 0,
    streak: 0,
    level: 1,
    xp: 0,
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats(data.stats);
        setUnlockedAchievements(data.achievements || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const calculateLevelProgress = () => {
    const xpForNextLevel = Math.pow((stats.level + 1) * 100, 2);
    const xpForCurrentLevel = Math.pow(stats.level * 100, 2);
    const progress = ((stats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center gap-6">
        <div className="relative">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
            Lvl {stats.level}
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
          <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500"
              style={{ width: `${calculateLevelProgress()}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {stats.xp} XP - Next level in {Math.ceil((1 - (calculateLevelProgress() / 100)) * 100)} XP
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <span className="text-2xl font-bold text-gray-900">{stats.totalItems}</span>
          <p className="text-sm text-gray-600">Total Items</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <span className="text-2xl font-bold text-gray-900">{stats.completedItems}</span>
          <p className="text-sm text-gray-600">Completed</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <span className="text-2xl font-bold text-gray-900">{stats.streak}</span>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <span className="text-2xl font-bold text-gray-900">
            {((stats.completedItems / stats.totalItems) * 100 || 0).toFixed(0)}%
          </span>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg text-center ${
                unlockedAchievements.includes(achievement.id)
                  ? 'bg-primary-50 border-2 border-primary-200'
                  : 'bg-gray-50 opacity-50'
              }`}
            >
              <span className="text-3xl mb-2 block" role="img" aria-label={achievement.title}>
                {achievement.icon}
              </span>
              <h4 className="font-semibold text-sm">{achievement.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}; 