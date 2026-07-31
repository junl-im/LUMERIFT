import { doc, getDoc, serverTimestamp, setDoc, type Firestore } from 'firebase/firestore';
import {
  characterAppearanceCloudPathSegments,
  parseCharacterAppearanceCloudEnvelope,
  type CharacterAppearanceCloudEnvelope,
} from '../core/presentation/CharacterAppearanceCloudSync';

export interface CharacterAppearanceCloudRepository {
  readonly available: boolean;
  load(uid: string): Promise<CharacterAppearanceCloudEnvelope | undefined>;
  save(envelope: CharacterAppearanceCloudEnvelope): Promise<void>;
}

export class DisabledCharacterAppearanceCloudRepository implements CharacterAppearanceCloudRepository {
  public readonly available = false;

  public async load(): Promise<undefined> {
    return undefined;
  }

  public async save(): Promise<void> {
    throw new Error('Firebase Firestore가 준비되지 않아 외형 프리셋 Cloud Save를 사용할 수 없습니다.');
  }
}

export class FirestoreCharacterAppearanceCloudRepository implements CharacterAppearanceCloudRepository {
  public readonly available = true;

  public constructor(private readonly db: Firestore) {}

  public async load(uid: string): Promise<CharacterAppearanceCloudEnvelope | undefined> {
    const [collection, ownerUid, settings, documentId] = characterAppearanceCloudPathSegments(uid);
    const snapshot = await getDoc(doc(this.db, collection, ownerUid, settings, documentId));
    if (!snapshot.exists()) return undefined;
    return parseCharacterAppearanceCloudEnvelope(snapshot.data(), uid);
  }

  public async save(envelope: CharacterAppearanceCloudEnvelope): Promise<void> {
    const [collection, ownerUid, settings, documentId] = characterAppearanceCloudPathSegments(envelope.ownerUid);
    await setDoc(doc(this.db, collection, ownerUid, settings, documentId), {
      ...envelope,
      serverUpdatedAt: serverTimestamp(),
    });
  }
}
