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

    return () => unsubscribe();
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
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (authError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setError(null);
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
        errorMessage = 'This email is already registered';
      } else if (authError.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
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