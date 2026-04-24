import {
  getDocs,
  getDocsFromCache,
  Query,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

/**
 * Attempt to fetch documents from Firestore. If the client is offline
 * (FirebaseError code 'unavailable' / 'failed-precondition'), fall back
 * to reading from the local persistent cache instead of throwing.
 */
export async function getDocsOfflineFirst<T = DocumentData>(
  q: Query<T>
): Promise<QuerySnapshot<T>> {
  try {
    return await getDocs(q);
  } catch (err: unknown) {
    const isOffline =
      err instanceof Error &&
      'code' in err &&
      (
        (err as { code: string }).code === 'unavailable' ||
        (err as { code: string }).code === 'failed-precondition'
      );

    if (isOffline) {
      console.warn(
        '[Firestore] Client appears offline — reading from cache.',
        (err as Error).message
      );
      return await getDocsFromCache(q);
    }

    // Re-throw anything that isn't an offline error
    throw err;
  }
}
