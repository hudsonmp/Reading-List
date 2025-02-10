'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { addToReadingList } from '../lib/reading-list-service';
import type { AddReadingItemInput } from '../lib/reading-list-service';

interface AddToListButtonProps {
  item: AddReadingItemInput;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function AddToListButton({
  item,
  onSuccess,
  onError
}: AddToListButtonProps) {
  const { data: session, status } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = async () => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      // Redirect to sign in if not authenticated
      signIn(undefined, { callbackUrl: window.location.href });
      return;
    }

    if (isAdded || isAdding) return;

    try {
      setIsAdding(true);
      await addToReadingList(session.user.id, item);
      setIsAdded(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding to list:', error);
      onError?.(error as Error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAdding}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg
        transition-colors duration-200
        ${isAdded
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isAdding ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Adding...
        </>
      ) : isAdded ? (
        <>
          <BookmarkCheck className="w-5 h-5" />
          Added to List
        </>
      ) : (
        <>
          <Bookmark className="w-5 h-5" />
          Add to List
        </>
      )}
    </button>
  );
} 