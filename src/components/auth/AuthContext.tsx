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
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // Handle navigation before auth state changes
  const handleSuccessfulAuth = () => {
    setLoading(false);
    router.push('/');
    router.refresh();
  };

  useEffect(() => {
    let mounted = true;

    // Check for existing auth state immediately
    const currentUser = auth.currentUser;
    if (currentUser && mounted) {
      setUser(currentUser);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;

      if (user) {
        setUser(user);
        // Create user document in Firestore only if it doesn't exist
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            setDoc(userRef, {
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
            }).catch(console.error);
          }
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      handleSuccessfulAuth();
    } catch (error) {
      setLoading(false);
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
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      handleSuccessfulAuth();
    } catch (error) {
      setLoading(false);
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
      setLoading(true);
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
      
      handleSuccessfulAuth();
    } catch (error) {
      setLoading(false);
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
      setLoading(true);
      await signOut(auth);
      router.push('/');
    } catch (error) {
      setLoading(false);
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