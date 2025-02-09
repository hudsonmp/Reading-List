import { db } from './firebase-config';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
} from 'firebase/firestore';

export interface ReadingItem {
  id?: string;
  title: string;
  url?: string;
  type: 'book' | 'website' | 'article' | 'report';
  notes?: string;
  completed: boolean;
  dateAdded: string;
  userId: string;
}

export const addItem = async (item: Omit<ReadingItem, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'readingItems'), item);
    return { ...item, id: docRef.id };
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

export const updateItem = async (id: string, data: Partial<ReadingItem>) => {
  try {
    const itemRef = doc(db, 'readingItems', id);
    await updateDoc(itemRef, data);
    return { id, ...data };
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

export const deleteItem = async (id: string) => {
  try {
    const itemRef = doc(db, 'readingItems', id);
    await deleteDoc(itemRef);
    return id;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getUserItems = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'readingItems'),
      where('userId', '==', userId),
      orderBy('dateAdded', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ReadingItem[];
  } catch (error) {
    console.error('Error getting user items:', error);
    throw error;
  }
}; 