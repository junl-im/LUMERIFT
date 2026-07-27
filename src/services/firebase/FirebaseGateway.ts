import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { readFirebaseConfig } from './firebaseConfig';

export class FirebaseGateway {
  public app?: FirebaseApp;
  public auth?: Auth;
  public db?: Firestore;
  public isConfigured = false;

  public async initialize(): Promise<void> {
    const config = readFirebaseConfig();
    if (!config) {
      console.info('[Firebase] 환경 변수가 없어 로컬 개발 모드로 시작합니다.');
      return;
    }

    this.app = getApps().length > 0 ? getApp() : initializeApp(config);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.isConfigured = true;
  }
}
