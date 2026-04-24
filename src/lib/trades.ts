import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { getDocsOfflineFirst } from './firestoreHelpers';

export interface Trade {
  id?: string;
  uid: string;
  ticker: string;
  entryPrice: number;
  exitPrice: number | null;
  date: string;
  notes: string;
  chartUrl: string;
  status: 'open' | 'closed';
  createdAt: string;
}

const COLLECTION = 'trades';

function getDb() {
  if (!db) throw new Error('Firebase not configured');
  return db;
}

export async function addTrade(trade: Omit<Trade, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), COLLECTION), {
    ...trade,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateTrade(id: string, data: Partial<Trade>): Promise<void> {
  await updateDoc(doc(getDb(), COLLECTION, id), data);
}

export async function deleteTrade(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, id));
}

export async function getTradesByUser(uid: string): Promise<Trade[]> {
  const q = query(
    collection(getDb(), COLLECTION),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocsOfflineFirst(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Trade));
}
