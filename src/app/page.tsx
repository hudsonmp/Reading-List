'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { ReadingList } from '@/components/lists/ReadingList';
import { UserProfile } from '@/components/profile/UserProfile';
import { AddContentForm } from '@/components/content/AddContentForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, displayName: string) => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  error,
  onSignIn,
  onSignUp,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSigningIn(true);
      await onSignIn(email, password);
      resetForm();
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRegistering(true);
      await onSignUp(email, password, displayName);
      resetForm();
    } catch (error) {
      console.error('Error signing up:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setShowSignUp(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {showSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={showSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {showSignUp && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-gray-900 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSigningIn || isRegistering}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg"
          >
            {isSigningIn || isRegistering ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>{isSigningIn ? 'Signing in...' : 'Creating account...'}</span>
              </div>
            ) : (
              showSignUp ? 'Sign Up' : 'Sign In'
            )}
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
    </div>
  );
};

export default function Home() {
  const { user, loading, error, signInWithEmail, signUpWithEmail } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
    setShowAuthModal(false);
  };

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    await signUpWithEmail(email, password, displayName);
    setShowAuthModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reading List Platform</h1>
          {user ? (
            <UserProfile />
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Sign In
            </button>
          )}
        </div>
        
        <div className="mt-8 grid gap-8 md:grid-cols-[300px,1fr]">
          <div>
            {user ? (
              <AddContentForm />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Start Tracking Your Reading</h2>
                <p className="text-gray-600 mb-4">Sign in to add and track your reading progress.</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="btn-primary w-full"
                >
                  Sign In to Add Content
                </button>
              </div>
            )}
          </div>
          <div>
            <ReadingList />
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        error={error}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
      />
    </div>
  );
} 