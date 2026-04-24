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

export interface Client {
  id?: string;
  uid: string;
  name: string;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  type: 'individual' | 'group';
  members: string[];
  notes: string;
  createdAt: string;
}

export interface Insight {
  id?: string;
  clientId: string;
  uid: string;
  ticker: string;
  advice: string;
  riskLevel: 'low' | 'medium' | 'high';
  outcome: 'pending' | 'profit' | 'loss' | 'neutral';
  outcomeNotes: string;
  createdAt: string;
}

const CLIENTS = 'clients';
const INSIGHTS = 'insights';

function getDb() {
  if (!db) throw new Error('Firebase not configured');
  return db;
}

// ---- Clients ----
export async function addClient(client: Omit<Client, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), CLIENTS), {
    ...client,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateClient(id: string, data: Partial<Client>): Promise<void> {
  await updateDoc(doc(getDb(), CLIENTS, id), data);
}

export async function deleteClient(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), CLIENTS, id));
}

export async function getClientsByUser(uid: string): Promise<Client[]> {
  const q = query(
    collection(getDb(), CLIENTS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocsOfflineFirst(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Client));
}

// ---- Insights ----
export async function addInsight(insight: Omit<Insight, 'id'>): Promise<string> {
  const ref = await addDoc(collection(getDb(), INSIGHTS), {
    ...insight,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function updateInsight(id: string, data: Partial<Insight>): Promise<void> {
  await updateDoc(doc(getDb(), INSIGHTS, id), data);
}

export async function deleteInsight(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), INSIGHTS, id));
}

export async function getInsightsByClient(clientId: string): Promise<Insight[]> {
  const q = query(
    collection(getDb(), INSIGHTS),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocsOfflineFirst(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight));
}

export async function getInsightsByUser(uid: string): Promise<Insight[]> {
  const q = query(
    collection(getDb(), INSIGHTS),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocsOfflineFirst(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight));
}
