import { doc, getDoc, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore';
import { migratePlayerProfile, type PlayerProfile, type PlayerRepository } from './PlayerRepository';

export class FirestorePlayerRepository implements PlayerRepository {
  public constructor(private readonly db: Firestore) {}

  public async load(uid: string): Promise<PlayerProfile | null> {
    const snapshot = await getDoc(doc(this.db, 'users', uid));
    if (!snapshot.exists()) return null;
    return migratePlayerProfile(snapshot.data(), uid);
  }

  public async save(profile: PlayerProfile): Promise<void> {
    await setDoc(doc(this.db, 'users', profile.uid), {
      ...profile,
      uid: profile.uid,
      updatedAt: Date.now(),
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true });
  }
}
