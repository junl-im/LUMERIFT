import { GoogleAuthProvider, signInAnonymously, signInWithPopup, type User } from 'firebase/auth';
import { STORAGE_KEYS } from '../../app/brand';
import type { FirebaseGateway } from '../firebase/FirebaseGateway';

export interface AuthSession {
  readonly uid: string;
  readonly displayName: string;
  readonly provider: 'guest' | 'google' | 'local-dev';
}

export class AuthService {
  private session?: AuthSession;

  public constructor(private readonly firebase: FirebaseGateway) {}

  public get currentSession(): AuthSession | undefined {
    return this.session;
  }

  public async signInGuest(): Promise<AuthSession> {
    if (!this.firebase.auth) {
      const legacyId = localStorage.getItem('rpg.localUid');
      const localId = localStorage.getItem(STORAGE_KEYS.localUid) ?? legacyId ?? crypto.randomUUID();
      localStorage.setItem(STORAGE_KEYS.localUid, localId);
      this.session = { uid: localId, displayName: '루멘 게스트', provider: 'local-dev' };
      return this.session;
    }

    const credential = await signInAnonymously(this.firebase.auth);
    return this.fromFirebaseUser(credential.user, 'guest');
  }

  public async signInGoogle(): Promise<AuthSession> {
    if (!this.firebase.auth) throw new Error('Firebase 환경 변수를 먼저 설정해 주세요.');

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(this.firebase.auth, provider);
    return this.fromFirebaseUser(credential.user, 'google');
  }

  private fromFirebaseUser(user: User, provider: 'guest' | 'google'): AuthSession {
    this.session = {
      uid: user.uid,
      displayName: user.displayName?.trim() || (provider === 'guest' ? '게스트 계승자' : '계승자'),
      provider,
    };
    return this.session;
  }
}
