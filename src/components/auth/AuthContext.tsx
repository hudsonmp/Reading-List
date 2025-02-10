'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, db, googleProvider } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: new Date().toISOString(),
              stats: {
                totalItems: 0,
                completedItems: 0,
                streak: 0,
                level: 1,
                xp: 0,
              },
            });
          }
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      }
      setUser(user);
      setLoading(false);
    });

    // Set loading to false after a shorter timeout
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing in with Google:', authError);
      
      let errorMessage = 'An error occurred during sign in';
      if (authError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (authError.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up was blocked by the browser. Please enable pop-ups for this site.';
      } else if (authError.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google sign-in. Please contact support.';
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing in with email:', authError);
      
      let errorMessage = 'An error occurred during sign in';
      if (authError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please check your email or sign up.';
      } else if (authError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again or reset your password.';
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again in a few minutes.';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        throw new Error('Password too short');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        email: email,
        displayName: displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        stats: {
          totalItems: 0,
          completedItems: 0,
          streak: 0,
          level: 1,
          xp: 0,
        },
      });
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing up with email:', authError);
      
      let errorMessage = 'An error occurred during sign up';
      if (authError.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in or use a different email.';
      } else if (authError.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Error signing out');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 