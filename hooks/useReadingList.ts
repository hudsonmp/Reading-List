import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addItem, updateItem, deleteItem, getUserItems } from '@/lib/firebase-service';
import type { ReadingItem } from '@/lib/firebase-service';

export function useReadingList() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      if (session?.user?.id) {
        try {
          const userItems = await getUserItems(session.user.id);
          setItems(userItems);
        } catch (error) {
          console.error('Error fetching items:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchItems();
  }, [session?.user?.id]);

  const handleAddItem = async (newItem: Omit<ReadingItem, 'id' | 'userId' | 'dateAdded' | 'completed'>) => {
    if (!session?.user?.id) return null;
    
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
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await updateItem(id, { completed: !completed });
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, completed: !completed } : item
      ));
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return {
    items,
    loading,
    addItem: handleAddItem,
    toggleComplete: handleToggleComplete,
    deleteItem: handleDeleteItem,
  };
} 