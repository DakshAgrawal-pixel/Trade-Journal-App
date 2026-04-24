import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

function getStorage() {
  if (!storage) throw new Error('Firebase Storage not configured');
  return storage;
}

export async function uploadChartImage(
  uid: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(getStorage(), `charts/${uid}/${timestamp}_${safeName}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}
