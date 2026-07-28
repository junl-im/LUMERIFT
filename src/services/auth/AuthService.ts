import {
  EmailAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithCredential,
  linkWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
  type User,
} from 'firebase/auth';
import { STORAGE_KEYS } from '../../app/brand';
import type { FirebaseGateway } from '../firebase/FirebaseGateway';

export type AuthProvider = 'guest' | 'google' | 'email' | 'local-dev';

export interface AuthSession {
  readonly uid: string;
  readonly displayName: string;
  readonly provider: AuthProvider;
  readonly email?: string;
  readonly anonymous: boolean;
  readonly emailVerified: boolean;
}

export class AuthService {
  private session?: AuthSession;

  public constructor(private readonly firebase: FirebaseGateway) {}

  public get currentSession(): AuthSession | undefined {
    return this.session;
  }

  public async restoreSession(): Promise<AuthSession | undefined> {
    const auth = this.firebase.auth;
    if (!auth) return undefined;
    await auth.authStateReady();
    this.session = auth.currentUser ? this.fromFirebaseUser(auth.currentUser) : undefined;
    return this.session;
  }

  public async signInGuest(): Promise<AuthSession> {
    if (!this.firebase.auth) {
      const legacyId = localStorage.getItem('rpg.localUid');
      const localId = localStorage.getItem(STORAGE_KEYS.localUid) ?? legacyId ?? crypto.randomUUID();
      localStorage.setItem(STORAGE_KEYS.localUid, localId);
      this.session = {
        uid: localId,
        displayName: '루멘 게스트',
        provider: 'local-dev',
        anonymous: true,
        emailVerified: false,
      };
      return this.session;
    }

    const current = this.firebase.auth.currentUser;
    if (current) return this.fromFirebaseUser(current);
    const credential = await signInAnonymously(this.firebase.auth);
    return this.fromFirebaseUser(credential.user);
  }

  public async signInGoogle(): Promise<AuthSession> {
    const auth = this.requireAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const credential = auth.currentUser?.isAnonymous
        ? await linkWithPopup(auth.currentUser, provider)
        : await signInWithPopup(auth, provider);
      return this.fromFirebaseUser(credential.user);
    } catch (error: unknown) {
      throw new Error(this.authErrorMessage(error));
    }
  }

  public async registerEmail(email: string, password: string): Promise<AuthSession> {
    const auth = this.requireAuth();
    try {
      if (auth.currentUser?.isAnonymous) {
        const credential = EmailAuthProvider.credential(email, password);
        const result = await linkWithCredential(auth.currentUser, credential);
        return this.fromFirebaseUser(result.user);
      }
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return this.fromFirebaseUser(result.user);
    } catch (error: unknown) {
      throw new Error(this.authErrorMessage(error));
    }
  }

  public async signInEmail(email: string, password: string): Promise<AuthSession> {
    const auth = this.requireAuth();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return this.fromFirebaseUser(result.user);
    } catch (error: unknown) {
      throw new Error(this.authErrorMessage(error));
    }
  }


  public async sendVerification(): Promise<void> {
    const user = this.requireAuth().currentUser;
    if (!user || user.isAnonymous || !user.email) throw new Error('이메일 계정에서만 인증 메일을 보낼 수 있습니다.');
    if (user.emailVerified) return;
    try {
      await sendEmailVerification(user);
    } catch (error: unknown) {
      throw new Error(this.authErrorMessage(error));
    }
  }

  public async sendPasswordReset(email?: string): Promise<void> {
    const target = email?.trim() || this.requireAuth().currentUser?.email || '';
    if (!target) throw new Error('비밀번호를 재설정할 이메일 주소가 필요합니다.');
    try {
      await sendPasswordResetEmail(this.requireAuth(), target);
    } catch (error: unknown) {
      throw new Error(this.authErrorMessage(error));
    }
  }

  public async refreshSession(): Promise<AuthSession | undefined> {
    const user = this.requireAuth().currentUser;
    if (!user) {
      this.session = undefined;
      return undefined;
    }
    await reload(user);
    return this.fromFirebaseUser(user);
  }

  public async signOutCurrent(): Promise<void> {
    if (this.firebase.auth) await signOut(this.firebase.auth);
    this.session = undefined;
  }

  private requireAuth() {
    if (!this.firebase.auth) throw new Error('Firebase Authentication 초기화에 실패했습니다.');
    return this.firebase.auth;
  }

  private fromFirebaseUser(user: User): AuthSession {
    const provider: AuthProvider = user.isAnonymous
      ? 'guest'
      : user.providerData.some((entry: { providerId: string }) => entry.providerId === 'google.com')
        ? 'google'
        : 'email';
    const fallbackName = provider === 'guest' ? '게스트 계승자' : user.email?.split('@')[0] || '계승자';
    this.session = {
      uid: user.uid,
      displayName: user.displayName?.trim() || fallbackName,
      provider,
      email: user.email ?? undefined,
      anonymous: user.isAnonymous,
      emailVerified: user.emailVerified,
    };
    return this.session;
  }

  private authErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : '';
    const messages: Record<string, string> = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다. 이메일 로그인을 이용해 주세요.',
      'auth/invalid-email': '이메일 주소 형식이 올바르지 않습니다.',
      'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'auth/weak-password': '비밀번호는 최소 6자 이상 입력해 주세요.',
      'auth/popup-closed-by-user': 'Google 로그인 창이 닫혔습니다.',
      'auth/popup-blocked': '팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.',
      'auth/credential-already-in-use': '이미 다른 계정에 연결된 로그인 정보입니다. 해당 계정으로 로그인해 주세요.',
      'auth/account-exists-with-different-credential': '같은 이메일이 다른 로그인 방식으로 가입되어 있습니다.',
      'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
      'auth/too-many-requests': '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      'auth/user-not-found': '해당 이메일 계정을 찾을 수 없습니다.',
      'auth/requires-recent-login': '보안을 위해 다시 로그인한 뒤 시도해 주세요.',
      'auth/unauthorized-domain': '현재 도메인이 Firebase 승인 도메인에 등록되지 않았습니다.',
    };
    return messages[code] ?? (error instanceof Error ? error.message : '로그인 중 오류가 발생했습니다.');
  }
}
