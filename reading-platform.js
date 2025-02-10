// File: src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Add your Firebase configuration here
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// File: src/components/auth/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// File: src/services/claudeService.js
const CLAUDE_API_KEY = process.env.REACT_APP_CLAUDE_API_KEY;

export const analyzeContent = async (content) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Analyze the following content and provide: 
          1. A brief summary
          2. Key themes and keywords
          3. Estimated reading time
          4. Complexity score (1-10)
          5. Main takeaways
          
          Content: ${content}`
        }]
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
};

// File: src/services/googleSearchService.js
const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = process.env.REACT_APP_SEARCH_ENGINE_ID;

export const findRelatedContent = async (keywords) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${keywords}`
    );
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error finding related content:', error);
    throw error;
  }
};

// File: src/components/content/ContentCard.js
import React from 'react';
import { motion } from 'framer-motion';

const ContentCard = ({ content, onAnalyze }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-4"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-2">{content.title}</h3>
          <p className="text-gray-600 mb-4">{content.type}</p>
          <div className="flex gap-2 mb-4">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">
            Added {new Date(content.dateAdded).toLocaleDateString()}
          </span>
          <div className="mt-2">
            <button
              onClick={() => onAnalyze(content)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition"
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
      {content.analysis && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Analysis</h4>
          <p>{content.analysis.summary}</p>
          <div className="mt-2 flex gap-4">
            <span>Reading time: {content.analysis.readingTime}min</span>
            <span>Complexity: {content.analysis.complexity}/10</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// File: src/components/profile/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const UserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    completedItems: 0,
    streak: 0,
    level: 1,
    xp: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setStats(docSnap.data().stats);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const calculateLevel = (xp) => {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">
              {profile?.displayName?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile?.displayName}</h2>
            <p className="text-gray-600">Level {stats.level}</p>
            <div className="mt-2 w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{
                  width: `${(stats.xp % 100) / 100 * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold">{stats.totalItems}</span>
            <p className="text-gray-600">Total Items</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold">{stats.completedItems}</span>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold">{stats.streak}</span>
            <p className="text-gray-600">Day Streak</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <span className="text-2xl font-bold">{stats.xp}</span>
            <p className="text-gray-600">XP</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// File: src/components/lists/ReadingList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import ContentCard from '../content/ContentCard';
import { analyzeContent } from '../../services/claudeService';
import { findRelatedContent } from '../../services/googleSearchService';

const ReadingList = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (user) {
        const q = query(
          collection(db, 'items'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedItems = [];
        querySnapshot.forEach((doc) => {
          fetchedItems.push({ id: doc.id, ...doc.data() });
        });
        setItems(fetchedItems);
        setLoading(false);
      }
    };

    fetchItems();
  }, [user]);

  const handleAnalyze = async (item) => {
    try {
      const analysis = await analyzeContent(item.content);
      const relatedContent = await findRelatedContent(analysis.keywords.join(' '));
      
      // Update item in Firestore with analysis and related content
      const itemRef = doc(db, 'items', item.id);
      await updateDoc(itemRef, {
        analysis,
        relatedContent
      });

      // Update local state
      setItems(items.map(i => 
        i.id === item.id 
          ? { ...i, analysis, relatedContent }
          : i
      ));
    } catch (error) {
      console.error('Error analyzing content:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Reading List</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('toRead')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'toRead'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            To Read
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'completed'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {items
            .filter(item => 
              filter === 'all' ? true :
              filter === 'toRead' ? !item.completed :
              item.completed
            )
            .map(item => (
              <ContentCard
                key={item.id}
                content={item}
                onAnalyze={handleAnalyze}
              />
            ))}
        </div>
      )}
    </div>
  );
};
