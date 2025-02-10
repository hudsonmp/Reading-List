import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface ReadingItem {
  id: string;
  userId: string;
  title: string;
  link: string;
  type: 'book' | 'article' | 'video';
  source: string;
  snippet?: string;
  thumbnailUrl?: string;
  status: 'unread' | 'reading' | 'completed';
  addedAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface AddReadingItemInput {
  title: string;
  link: string;
  type: 'book' | 'article' | 'video';
  source: string;
  snippet?: string;
  thumbnailUrl?: string;
}

export async function addToReadingList(
  userId: string,
  item: AddReadingItemInput
): Promise<string> {
  try {
    // Check if item already exists
    const existingQuery = query(
      collection(db, 'readingList'),
      where('userId', '==', userId),
      where('link', '==', item.link)
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      throw new Error('This item is already in your reading list');
    }

    const docRef = await addDoc(collection(db, 'readingList'), {
      ...item,
      userId,
      status: 'unread',
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding to reading list:', error);
    throw error;
  }
}

export async function getReadingList(userId: string): Promise<ReadingItem[]> {
  try {
    const q = query(
      collection(db, 'readingList'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      addedAt: doc.data().addedAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ReadingItem[];
  } catch (error) {
    console.error('Error getting reading list:', error);
    throw error;
  }
}

export async function updateReadingItem(
  itemId: string,
  userId: string,
  updates: Partial<ReadingItem>
): Promise<void> {
  try {
    const docRef = doc(db, 'readingList', itemId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Item not found');
    }
    
    if (docSnap.data()?.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating reading item:', error);
    throw error;
  }
}

export async function removeFromReadingList(
  itemId: string,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, 'readingList', itemId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Item not found');
    }
    
    if (docSnap.data()?.userId !== userId) {
      throw new Error('Unauthorized');
    }

    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error removing from reading list:', error);
    throw error;
  }
} 