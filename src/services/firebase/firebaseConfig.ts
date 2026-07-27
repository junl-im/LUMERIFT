export interface FirebaseWebConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket?: string;
  readonly messagingSenderId?: string;
  readonly appId: string;
  readonly measurementId?: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseWebConfig = {
  apiKey: 'AIzaSyBZbaZ30rrnde1kuyZpMyD0DdiIhYQiuYA',
  authDomain: 'lumerift-8db07.firebaseapp.com',
  projectId: 'lumerift-8db07',
  storageBucket: 'lumerift-8db07.firebasestorage.app',
  messagingSenderId: '730689598811',
  appId: '1:730689598811:web:0d6df62752d7fe0e3c167e',
  measurementId: 'G-1H8HXQKMY7',
};

export function readFirebaseConfig(): FirebaseWebConfig {
  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY') ?? DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN') ?? DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID') ?? DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET') ?? DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') ?? DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: readEnv('VITE_FIREBASE_APP_ID') ?? DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID') ?? DEFAULT_FIREBASE_CONFIG.measurementId,
  };
}

export function shouldUseFirebaseEmulators(): boolean {
  return readEnv('VITE_FIREBASE_USE_EMULATORS') === 'true';
}


function readEnv(key: string): string | undefined {
  const raw = import.meta.env[key];
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value || undefined;
}
