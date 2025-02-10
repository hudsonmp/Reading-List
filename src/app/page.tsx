'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { ReadingList } from '@/components/lists/ReadingList';
import { UserProfile } from '@/components/profile/UserProfile';
import { AddContentForm } from '@/components/content/AddContentForm';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const { user, loading, error, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithEmail(email, password);
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setIsRegistering(true);
      await signUpWithEmail(email, password, displayName);
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-white"
        >
          <h1 className="text-4xl font-bold mb-4">Reading List Platform</h1>
          <p className="text-lg mb-8">Track, analyze, and discover new content</p>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4"
            >
              {error}
            </motion.div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (showSignUp) {
                handleSignUp();
              } else {
                handleSignIn();
              }
            }} className="space-y-4">
              {showSignUp && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSigningIn || isRegistering}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
              >
                {isSigningIn || isRegistering ? 'Processing...' : (showSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSignUp(!showSignUp)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {showSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile />
        <div className="mt-8 grid gap-8 md:grid-cols-[300px,1fr]">
          <div>
            <AddContentForm />
          </div>
          <div>
            <ReadingList />
          </div>
        </div>
      </div>
    </div>
  );
} 