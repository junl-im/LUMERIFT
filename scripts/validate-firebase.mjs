import { readFile } from 'node:fs/promises';

const errors = [];
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const config = await readFile('src/services/firebase/firebaseConfig.ts', 'utf8');
const gateway = await readFile('src/services/firebase/FirebaseGateway.ts', 'utf8');
const auth = await readFile('src/services/auth/AuthService.ts', 'utf8');
const rules = await readFile('firestore.rules', 'utf8');
const firebaseJson = JSON.parse(await readFile('firebase.json', 'utf8'));
const indexes = JSON.parse(await readFile('firestore.indexes.json', 'utf8'));

if (pkg.dependencies?.firebase !== '12.16.0') errors.push('firebase npm dependency must remain pinned to 12.16.0');
for (const marker of ['lumerift-8db07', '730689598811', 'G-1H8HXQKMY7']) {
  if (!config.includes(marker)) errors.push(`Firebase config marker missing: ${marker}`);
}
for (const marker of ['persistentLocalCache', 'persistentMultipleTabManager', 'browserLocalPersistence', 'initializeAppCheck']) {
  if (!gateway.includes(marker)) errors.push(`Firebase runtime feature missing: ${marker}`);
}
for (const marker of ['signInAnonymously', 'signInWithPopup', 'signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'linkWithCredential']) {
  if (!auth.includes(marker)) errors.push(`Auth provider flow missing: ${marker}`);
}
for (const marker of [
  'request.auth.uid == uid',
  "match /users/{uid}",
  "match /notices/{noticeId}",
  "match /coupons/{document=**}",
  "allow read, write: if false",
]) {
  if (!rules.includes(marker)) errors.push(`Firestore rules marker missing: ${marker}`);
}
if (firebaseJson.firestore?.indexes !== 'firestore.indexes.json') errors.push('firebase.json does not reference firestore.indexes.json');
if (!Array.isArray(indexes.indexes) || indexes.indexes.length < 2) errors.push('Firestore composite indexes are incomplete');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log('PASS Firebase integration: npm modular SDK, Auth 3 providers, offline cache, App Check hook, Firestore rules/indexes');
}
