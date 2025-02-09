import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { addItem, updateItem, deleteItem, getUserItems } from '../app/lib/firebase-service';
import type { ReadingItem } from '../app/lib/firebase-service';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export function useReadingList() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const initialLoadComplete = useRef(false);

  // Memoize the fetch function to prevent unnecessary rerenders
  const fetchItems = useCallback(async (isInitialLoad: boolean = false) => {
    if (!session?.user?.id || (!isInitialLoad && !hasMore)) return;

    try {
      setLoading(true);
      const { items: newItems, lastDoc } = await getUserItems(session.user.id, isInitialLoad ? undefined : lastDocRef.current);
      
      if (isInitialLoad) {
        setItems(newItems);
      } else {
        setItems(prev => [...prev, ...newItems]);
      }

      lastDocRef.current = lastDoc;
      setHasMore(!!lastDoc && newItems.length > 0);
      initialLoadComplete.current = true;
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, hasMore]);

  // Initial load
  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchItems(true);
    }
  }, [fetchItems]);

  const handleAddItem = useCallback(async (newItem: Omit<ReadingItem, 'id' | 'userId' | 'dateAdded' | 'completed'>) => {
    if (!session?.user?.id) {
      console.error('No user ID found in session');
      return null;
    }
    
    const itemToAdd = {
      ...newItem,
      userId: session.user.id,
      dateAdded: new Date().toISOString(),
      completed: false,
    };

    try {
      const addedItem = await addItem(itemToAdd);
      setItems(prev => [addedItem, ...prev]);
      return addedItem;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  }, [session?.user?.id]);

  const handleToggleComplete = useCallback(async (id: string, completed: boolean) => {
    try {
      // Optimistically update the UI
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, completed: !completed } : item
      ));
      
      // Then update the backend
      await updateItem(id, { completed: !completed });
    } catch (error) {
      // Revert on error
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, completed } : item
      ));
      console.error('Error toggling item:', error);
    }
  }, []);

  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      // Store current items for potential rollback
      const currentItems = [...items];
      
      // Optimistically update the UI
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Then update the backend
      await deleteItem(id);
    } catch (error) {
      // Revert on error
      setItems(currentItems);
      console.error('Error deleting item:', error);
    }
  }, [items]);

  return {
    items,
    loading,
    hasMore,
    loadMore: () => fetchItems(false),
    addItem: handleAddItem,
    toggleComplete: handleToggleComplete,
    deleteItem: handleDeleteItem,
  };
} 