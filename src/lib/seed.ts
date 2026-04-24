import { collection, query, where, addDoc } from 'firebase/firestore';
import { getDocsOfflineFirst } from './firestoreHelpers';
import { db } from './firebase';
import { Client } from './advisory';

function getDb() {
  if (!db) throw new Error('Firebase not configured');
  return db;
}

export async function seedIfEmpty(uid: string): Promise<boolean> {
  // Check if user already has clients
  const q = query(collection(getDb(), 'clients'), where('uid', '==', uid));
  const snap = await getDocsOfflineFirst(q);
  if (!snap.empty) return false;

  const seedClients: Omit<Client, 'id'>[] = [
    {
      uid,
      name: 'Chachu',
      riskProfile: 'moderate',
      type: 'individual',
      members: [],
      notes: 'Experienced trader, prefers mid-cap stocks. Looking for swing trade setups.',
      createdAt: new Date().toISOString(),
    },
    {
      uid,
      name: 'The 3 Underdogs',
      riskProfile: 'aggressive',
      type: 'group',
      members: ['Arjun', 'Karan', 'Sahil'],
      notes: 'New to trading, eager to learn. Focused on momentum plays and breakouts.',
      createdAt: new Date().toISOString(),
    },
  ];

  const seedInsights = [
    {
      uid,
      ticker: 'RELIANCE',
      advice: 'Accumulate near ₹2,400 support zone. Target ₹2,650 with SL at ₹2,350.',
      riskLevel: 'medium' as const,
      outcome: 'profit' as const,
      outcomeNotes: 'Hit target in 3 weeks. Clean breakout above ₹2,500.',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      uid,
      ticker: 'TCS',
      advice: 'Short-term bearish. Avoid fresh longs above ₹3,800. Wait for ₹3,600 retest.',
      riskLevel: 'low' as const,
      outcome: 'pending' as const,
      outcomeNotes: '',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      uid,
      ticker: 'INFY',
      advice: 'Momentum play for the group. Entry ₹1,480, SL ₹1,440, Target ₹1,560.',
      riskLevel: 'high' as const,
      outcome: 'loss' as const,
      outcomeNotes: 'SL hit after weak Q3 results. Lesson: avoid entries before earnings.',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    },
  ];

  // Add clients and associate insights
  for (let i = 0; i < seedClients.length; i++) {
    const clientRef = await addDoc(collection(getDb(), 'clients'), seedClients[i]);
    const insightsForClient =
      i === 0 ? [seedInsights[0], seedInsights[1]] : [seedInsights[2]];
    for (const insight of insightsForClient) {
      await addDoc(collection(getDb(), 'insights'), {
        ...insight,
        clientId: clientRef.id,
      });
    }
  }

  return true;
}
