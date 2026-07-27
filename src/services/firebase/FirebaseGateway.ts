import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import {
  readAppCheckSiteKey,
  readFirebaseConfig,
  shouldUseFirebaseEmulators,
} from './firebaseConfig';

export type FirebaseRuntimeMode = 'production' | 'emulator';

export class FirebaseGateway {
  public app?: FirebaseApp;
  public auth?: Auth;
  public db?: Firestore;
  public isConfigured = false;
  public runtimeMode: FirebaseRuntimeMode = 'production';
  public analyticsEnabled = false;
  public appCheckEnabled = false;
  public offlinePersistenceEnabled = false;

  public async initialize(): Promise<void> {
    const config = readFirebaseConfig();
    this.app = getApps().length > 0 ? getApp() : initializeApp(config);

    await this.initializeAppCheck();

    this.auth = getAuth(this.app);
    await setPersistence(this.auth, browserLocalPersistence);

    try {
      this.db = initializeFirestore(this.app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
      this.offlinePersistenceEnabled = true;
    } catch (error: unknown) {
      console.warn('[Firebase] IndexedDB 지속 캐시를 사용할 수 없어 메모리 캐시로 전환합니다.', error);
      this.db = getFirestore(this.app);
    }

    if (shouldUseFirebaseEmulators()) {
      connectAuthEmulator(this.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
      this.runtimeMode = 'emulator';
    }

    this.isConfigured = true;
    await this.initializeAnalytics(config.measurementId);
  }

  public describe(): string {
    const cache = this.offlinePersistenceEnabled ? 'IndexedDB' : 'memory';
    return `${this.runtimeMode} · ${cache} cache${this.appCheckEnabled ? ' · App Check' : ''}`;
  }

  private async initializeAnalytics(measurementId?: string): Promise<void> {
    if (!measurementId || !import.meta.env.PROD || this.runtimeMode === 'emulator') return;

    try {
      const { getAnalytics, isSupported } = await import('firebase/analytics');
      if (await isSupported()) {
        getAnalytics(this.app);
        this.analyticsEnabled = true;
      }
    } catch (error: unknown) {
      console.info('[Firebase] Analytics를 사용할 수 없는 환경입니다.', error);
    }
  }

  private async initializeAppCheck(): Promise<void> {
    const siteKey = readAppCheckSiteKey();
    if (!siteKey || !this.app || shouldUseFirebaseEmulators()) return;

    try {
      const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
      initializeAppCheck(this.app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      this.appCheckEnabled = true;
    } catch (error: unknown) {
      console.warn('[Firebase] App Check 초기화에 실패했습니다. 콘솔 적용은 아직 켜지 마세요.', error);
    }
  }
}
