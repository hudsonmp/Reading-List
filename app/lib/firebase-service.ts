import { db } from './firebase';
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
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';

export interface ReadingItem {
  id?: string;
  userId: string;
  title: string;
  url?: string;
  type: string;
  notes?: string;
  dateAdded: string;
  completed: boolean;
  // AI-enhanced fields
  description?: string;
  summary?: string;
  suggestedReadings?: {
    title: string;
    url?: string;
    reason: string;
  }[];
  relatedVideos?: {
    title: string;
    url: string;
    platform: string;
    thumbnail?: string;
  }[];
  aiAnalysis?: {
    keyPoints: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeToConsume: string;
    tags: string[];
    lastAnalyzed: string;
  };
}

const COLLECTION_NAME = 'reading-items';
const ITEMS_PER_PAGE = 10;

export async function getUserItems(
  userId: string,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ items: ReadingItem[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('dateAdded', 'desc'),
      limit(ITEMS_PER_PAGE)
    );

    if (lastDoc) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('dateAdded', 'desc'),
        startAfter(lastDoc),
        limit(ITEMS_PER_PAGE)
      );
    }

    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ReadingItem));

    return { items, lastDoc: lastVisible };
  } catch (error) {
    console.error('Error getting user items:', error);
    throw error;
  }
}

export async function addItem(item: Omit<ReadingItem, 'id'>): Promise<ReadingItem> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), item);
    return { ...item, id: docRef.id };
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
}

export async function updateItem(id: string, updates: Partial<ReadingItem>): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
} 